<?php 
namespace UNL\VisitorChat\Conversation;

class Edit extends \UNL\VisitorChat\Conversation\Record
{
    function __construct($options = array())
    {
        //Needs to be atleast a user to login.
        \UNL\VisitorChat\Controller::requireClientLogin();
        
        if (isset($options['id']) && $object = \UNL\VisitorChat\Conversation\Record::getByID($options['id'])) {
            $this->synchronizeWithArray($object->toArray());
        } else {
            if (!$conversation = \UNL\VisitorChat\User\Service::getCurrentUser()->getConversation()) {
                throw new \Exception("No conversation was found", 400);
            }
            $this->synchronizeWithArray($conversation->toArray());
        }
    }
    
    function canEdit($userID)
    {
        //Anyone currently involved in a chat can edit it.
        if (in_array($userID, $this->getInvolvedUsers())) {
            return true;
        }
        
        return false;
    }
    
    function handlePost($post = array())
    {
        //Preform a check first to see if we are deleing it.
        if (array_key_exists('delete', $post)) {
            //You must be a manager to delete a conversation
            if (!$this->canDelete(\UNL\VisitorChat\User\Service::getCurrentUser())) {
                throw new \Exception("you do not have permission to delete this conversation.", 403);
            }
            
            $this->delete();

            \Epoch\Controller::redirect(\UNL\VisitorChat\Controller::$URLService->generateSiteURL("success", true));
        }
        
        //otherwise, check if we can edit it
        if (!$this->canEdit($_SESSION['id'])) {
            throw new \Exception("you do not have permission to edit this.", 403);
        }
        
        //Handle status changes.
        if (isset($post['status']) && !empty($post['status'])) {
            $accepted = array("CLOSED"); //Only allowe closing for now.
            
            if (!in_array($post['status'], $accepted)) {
                throw new \Exception("invalid status.", 400);
            }
            
            if ($post['status'] == 'CLOSED') {
                $this->close();
            } else {
                $this->status = $post['status'];
                
                $this->save();
            }
        }
        
        \Epoch\Controller::redirect(\UNL\VisitorChat\Controller::$URLService->generateSiteURL("success", true));
    }
}