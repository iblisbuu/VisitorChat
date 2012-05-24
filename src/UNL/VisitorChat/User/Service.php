<?php
namespace UNL\VisitorChat\User;

class Service
{
    private static $user = false;
    
    public static function getCurrentUser()
    {
        if (!isset($_SESSION['id'])) {
            return false;
        }
        
        if (!self::$user) {
            if (!self::$user = Record::getByID($_SESSION['id'])) {
                throw new \Exception('Could not find the current user', 500);
            }
        }
        
        if (self::$user->id !== $_SESSION['id']) {
            self::$user = Record::getByID($_SESSION['id']);
        }
        
        return self::$user;
    }
    
    public static function setCurrentUser($user)
    {
        self::$user = $user;
        
        return true;
    }
    
    public static function areUsersAvaiable($users)
    {
        foreach ($users as $user) {
            if ($user->getRole() == 'other') {
                continue;
            }
            
            if (!$user = \UNL\VisitorChat\User\Record::getByUID($user->getUID())) {
                continue;
            }
            
            if ($user->status == 'AVAILABLE') {
                return true;
            }
        }
        
        return false;
    }
}