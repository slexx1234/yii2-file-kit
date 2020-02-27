/*!
 * Yii2 File Kit library
 * http://github.com/trntv/yii2-file-kit
 *
 * Author: Eugine Terentev <eugine@terentev.net>
 *
 * Date: 2014-05-01T17:11Z
 */
(function( $ ) {
    jQuery.fn.yiiUploadKit = function(options) {
        var input = this;
        var container = input.parent('div');
        var files = $('<ul>', {"class":"files"}).insertBefore(input);
        var settings = $.extend(true, {}, {
                name: 'file',
                multiple: true
            },
            options
        );
        settings.fileuploadOptions = $.extend(true, {}, {
                dataType: 'json',
                autoUpload: true,
                singleFileUploads: false,
                maxNumberOfFiles: 50,
                getNumberOfFiles: function(){
                    return container.find('.files .upload-kit-item').length;
                }
                //acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
                //maxFileSize: 5000000 // 5 MB
            },
            options.fileuploadOptions || {}
        );

        var methods = {
            init: function(){
                if(settings.multiple){
                    settings.name = settings.name + '[]'
                    input.attr('multiple', true);
                    input.attr('name', input.attr('name') + '[]');
                }
                container.addClass('upload-kit');
                if(settings.sortable){
                    files.sortable({
                        containment: "parent",
                        placeholder: "upload-kit-item sortable-placeholder",
                        tolerance: "pointer"
                    })
                }
                container.find('input[type=hidden]').not('.empty-value').appendTo(files).each(function(i, file){
                    $(this).replaceWith(methods.createItem({
                        url: $(this).val()
                    }))
                    methods.checkInputVisibility();
                })
                input.wrapAll($('<li class="upload-kit-input"></div>'))
                    .after($('<span class="glyphicon glyphicon-plus-sign add"></span>'))
                    .after($('<span class="glyphicon glyphicon-circle-arrow-down drag"></span>'))
                    .after($('<span/>', {"data-toggle":"popover", "class":"glyphicon glyphicon-exclamation-sign error-popover"}))
                    .after(
                    '<div class="progress">'+
                    '<div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>'+
                    '</li>'
                );

                methods.checkInputVisibility();
                methods.fileuploadInit();
                methods.dragInit()

            },
            fileuploadInit: function(){
                var fileuploadOptions = $.extend({}, {
                    url: settings.url,
                    dropZone: input.parents('.upload-kit-input'),
                    add: function(e,data){
                        var $this = $(this);
                        container.find('.upload-kit-input').removeClass('error');
                        data.process(function () {
                            return $this.fileupload('process', data);
                        }).done(function(){
                            if (data.autoUpload || (data.autoUpload !== false)){
                                data.submit();
                            }
                        }).fail(function () {
                            var errors = [];for(var i = 0; i < data.files.length; i++){
                                errors.push(data.files[i].name + ': ' + data.files[i].error);
                            }
                            methods.showError(errors.join('<br/>'))
                        });
                    },
                    start: function (e) {
                        container.find('.upload-kit-input')
                            .removeClass('error')
                            .addClass('in-progress')
                    },
                    progressall: function (e, data) {
                        var progress = parseInt(data.loaded / data.total * 100, 10);
                        container.find('.progress-bar').attr('aria-valuenow', progress).css(
                            'width',
                            progress + '%'
                        ).text(progress + '%');
                    },
                    done: function (e, data) {
                        if(data.result) {
                            for (var i = 0; i < data.result.length; i++) {
                                var file = data.result[i];
                                var item = methods.createItem(file);
                                item.appendTo(files);
                                methods.checkInputVisibility();
                            }
                        }
                    },
                    fail: function (e, data) {
                        methods.showError(data.errorThrown)
                    },
                    always: function(e){
                        $(e.target).parents('.upload-kit-input')
                            .removeClass('in-progress')
                            .find('.progress-bar').attr('aria-valuenow', 0)
                            .css('width', 0)
                            .text();
                    }

                }, settings.fileuploadOptions)
                input.fileupload(fileuploadOptions)
            },
            dragInit: function(){
                $(document).on('dragover', function ()
                {
                    $('.upload-kit-input').addClass('drag-highlight');
                });
                $(document).on('dragleave drop', function ()
                {
                    $('.upload-kit-input').removeClass('drag-highlight');
                });
            },
            showError: function(error){
                if($.fn.popover){
                    container.find('.error-popover').attr('data-content', error).popover({html:true,trigger:"hover"});
                }
                container.find('.upload-kit-input').addClass('error');
            },
            removeItem: function(){
                this.remove();
                methods.checkInputVisibility();
            },
            createItem: function(file){
                var ext = file.url.split('.').pop().toLowerCase();
                var isImage = ['png', 'jpg', 'jpeg', 'jpe', 'gif', 'webp', 'svg'].indexOf(ext) !== -1
                var item = $('<li>', {"class": "upload-kit-item"})
                    .append($('<input/>', {"type":"hidden", "value": file.url, "name": settings.name}))
                    .append($('<span class="extension"></span>'))
                    .append($('<span class="glyphicon glyphicon-remove-circle remove"></span>'))
                item.addClass('done')
                item.on('click', '.remove', function(){
                    methods.removeItem.call($(this).parents('.upload-kit-item'))
                })
                if(isImage){
                    item.removeClass('not-image').addClass('image');
                    item.prepend($('<img/>', {src:file.url}))
                    item.find('span.extension').text('');
                } else {
                    item.removeClass('image').addClass('not-image');
                    item.css('backgroundImage', '');
                    item.find('span.extension').text(ext);
                }
                return item;
            },
            checkInputVisibility: function(){
                var inputContainer = container.find('.upload-kit-input');
                if(settings.fileuploadOptions.getNumberOfFiles() < settings.fileuploadOptions.maxNumberOfFiles){
                    inputContainer.show();
                } else {
                    inputContainer.hide();
                }
            }
        }

        methods.init.apply(this);
        return this;
    };

})(jQuery)
