<?php
/**
 * Created by PhpStorm.
 * User: zein
 * Date: 7/13/14
 * Time: 1:04 PM
 */

namespace trntv\filekit\storage;

use yii\base\BootstrapInterface;
use yii\base\InvalidCallException;
use yii\helpers\ArrayHelper;

/**
 * Class FileStorage
 * @package common\components\fileStorage
 */
class FileStorage extends \yii\base\Component implements BootstrapInterface{

    /**
     * @var array
     */
    public $repositories = [];

    /**
     * @var array
     */
    public $_initiatedRepositories = [];

    /**
     * @param \yii\base\Application $app
     */
    public function bootstrap($app)
    {
        if (!isset($app->getI18n()->translations['extensions/trntv/filekit'])) {
            $app->getI18n()->translations['extensions/trntv/filekit'] = [
                'class' => 'yii\i18n\PhpMessageSource',
                'sourceLanguage' => 'en-US',
                'basePath' => '@trntv/filekit/messages',
                'fileMap'=>[
                    'extensions/trntv/filekit'=>'filekit.php'
                ]
            ];
        }
    }

    /**
     * @throws \yii\base\InvalidConfigException
     */
    public function init(){
        foreach($this->repositories as $name => $config){
            $config['name'] = isset($config['name']) ? $config['name'] : $name;
            $repository = \Yii::createObject($config);
            $this->_initiatedRepositories[$name] = $repository;
        }
    }

    /**
     * @param $file
     * @param null $category
     * @param null $repository
     * @return File
     */
    public function save($file, $category = null, $repository = null){
        $file = File::load($file);
        if($file) {
            return $this->getRepository($repository)->save($file, $category);
        }
    }

    /**
     * @param $files
     * @param null $category
     * @param null $repository
     * @return File[]
     */
    public function saveAll($files, $category = null, $repository = null){
        $result = [];
        foreach($files as $file){
            $result[] = $this->save($file, $category, $repository);
        }
        return $result;
    }

    /**
     * @param $file
     * @param null $repository
     * @return mixed
     */
    public function delete($file, $repository = null){
        $file = File::load($file);
        if($file) {
            return $this->getRepository($repository)->delete($file);
        }
    }

    /**
     * @param $files
     * @param null $repository
     */
    public function deleteAll($files, $repository = null){
        foreach($files as $file){
            $this->delete($file, $repository);
        }
    }

    /**
     * @param bool $name
     * @return mixed
     */
    public function getRepository($name = false){
        if(!$name){
            $repositories = $this->getRepositoriesList();
            $name = array_shift($repositories);
        }
        if(!$name || count($this->_initiatedRepositories) == 0 || !isset($this->_initiatedRepositories[$name])){
            throw new InvalidCallException("No such repository \"{$name}\"");
        }
        return ArrayHelper::getValue($this->_initiatedRepositories, $name);
    }

    /**
     * @return array
     */
    public function getRepositoriesList(){
        return array_keys($this->_initiatedRepositories);
    }

    /**
     * @return array
     */
    public function getAvailableRepositories(){
        $initiated = array_keys($this->_initiatedRepositories);
        return array_combine($initiated, $initiated);
    }
}