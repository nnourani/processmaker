<?php
include '../../../gulliver/Core/Bootstrap.php';
include '../../../workflow/engine/PmBootstrap.php';

$config = array(
    'path_trunk' => realpath('../../../')
);

$bootstrap = new PmBootstrap($config);
$bootstrap->registerClasses();
$bootstrap->configure();

if (! isset($argv[1])) {
    $help = '$>' . $argv[0] . " [option]\n";
    $help .= "Avalaibles options:\n";
    $help .= "    build-api  : Build the PM Rest API.\n";
    $help .= "    gen-ini    : Generates the rest config ini file.\n\n";

    echo $help;
    exit(0);
}

$restTool = new Service_Rest_RestTool();

try {
    switch ($argv[1]) {
        case 'build-api':
            $restTool->buildApi();
            break;

        case 'gen-ini':
            if (file_exists(PATH_CONFIG . '/rest-config.ini')) {
                echo "The file 'rest-config.ini' already exits, overwrite (Y/n)? ";
                $resp = trim(fgets(STDIN));

                if (strtolower($resp) != 'y') {
                    echo "Skipped\n";
                    exit(0);
                }
            }

            echo "Generating config ini file ... ";

            $genFile = $restTool->buildConfigIni();

            echo "DONE!\n";
            echo "File generated: $genFile\n\n";

            break;

        default:
            echo "Invalid option!\n";
            break;
    }
} catch (Exception $e) {
    echo $e->getMessage() . "\n";
}