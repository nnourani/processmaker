<?php

use Faker\Generator as Faker;

$factory->define(\ProcessMaker\Model\BpmnProject::class, function (Faker $faker) {
    // Create user
    $user = factory(\ProcessMaker\Model\User::class)->create();
    // Create process
    $process = factory(\ProcessMaker\Model\Process::class)->create();

    return [
        'PRJ_UID' => G::generateUniqueID(),
        'PRJ_NAME' => $faker->sentence(5),
        'PRJ_DESCRIPTION' => $faker->text,
        'PRJ_EXPRESION_LANGUAGE' => '',
        'PRJ_TYPE_LANGUAGE' => '',
        'PRJ_EXPORTER' => '',
        'PRJ_EXPORTER_VERSION' => '',
        'PRJ_CREATE_DATE' => $faker->dateTime(),
        'PRJ_UPDATE_DATE' => $faker->dateTime(),
        'PRJ_AUTHOR' => $user->USR_UID,
        'PRJ_AUTHOR_VERSION' => '',
        'PRJ_ORIGINAL_SOURCE' => '',
    ];
});
