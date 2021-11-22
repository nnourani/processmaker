<?php

namespace ProcessMaker\Office365OAuth;

use League\OAuth2\Client\Provider\GenericProvider;
use ProcessMaker\EmailOAuth\EmailBase;
use ProcessMaker\GmailOAuth\GmailOAuth;
use Stevenmaguire\OAuth2\Client\Provider\Microsoft;

class Office365OAuth
{

    use EmailBase;
    private $options = [
        'scope' => [
            'wl.imap',
            'wl.offline_access'
        ]
    ];

    /**
     * Constructor of the class.
     */
    public function __construct()
    {
        $this->setServer("smtp.office365.com");
        $this->setPort(587);
    }

    /**
     * Get $options property.
     * @return array
     */
    public function getOptions()
    {
        return $this->options;
    }

    /**
     * Get a Microsoft object, this may vary depending on the service provider.
     * @return Google_Client
     */
    public function getOffice365Client()
    {
        $provider = new Microsoft([
            'clientId' => $this->getClientID(),
            'clientSecret' => $this->getClientSecret(),
            'redirectUri' => $this->getRedirectURI(),
            'accessType' => 'offline'
        ]);
        return $provider;
    }
}
