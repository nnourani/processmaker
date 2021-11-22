<?php

/**
 * Model factory for a process
 */

use Faker\Generator as Faker;

$factory->define(\ProcessMaker\Model\Process::class, function (Faker $faker) {

    return [
        'PRO_UID' => G::generateUniqueID(),
        'PRO_ID' => $faker->unique()->numberBetween(1000),
        'PRO_TITLE' => $faker->sentence(3),
        'PRO_DESCRIPTION' => $faker->paragraph(3),
        'PRO_PARENT' => G::generateUniqueID(),
        'PRO_STATUS' => 'ACTIVE',
        'PRO_STATUS_ID' => 1,
        'PRO_TYPE' => 'NORMAL',
        'PRO_ASSIGNMENT' => 'FALSE',
        'PRO_TYPE_PROCESS' => 'PUBLIC',
        'PRO_UPDATE_DATE' => $faker->dateTime(),
        'PRO_CREATE_DATE' => $faker->dateTime(),
        'PRO_CREATE_USER' => '00000000000000000000000000000001',
        'PRO_DEBUG' => 0,
        'PRO_DYNAFORMS' => serialize([]),
        'PRO_ITEE' => 1,
        'PRO_ACTION_DONE' => serialize([]),
        'PRO_CATEGORY' => function () {
            return factory(\ProcessMaker\Model\ProcessCategory::class)->create()->CATEGORY_UID;
        },
        'CATEGORY_ID' => 0
    ];
});

// Create a process with the foreign keys
$factory->state(\ProcessMaker\Model\Process::class, 'foreign_keys', function (Faker $faker) {
    // Create user
    $user = factory(\ProcessMaker\Model\User::class)->create();

    return [
        'PRO_UID' => G::generateUniqueID(),
        'PRO_ID' => $faker->unique()->numberBetween(1000),
        'PRO_TITLE' => $faker->sentence(3),
        'PRO_DESCRIPTION' => $faker->paragraph(3),
        'PRO_PARENT' => G::generateUniqueID(),
        'PRO_STATUS' => 'ACTIVE',
        'PRO_STATUS_ID' => 1,
        'PRO_TYPE' => 'NORMAL',
        'PRO_ASSIGNMENT' => 'FALSE',
        'PRO_TYPE_PROCESS' => 'PUBLIC',
        'PRO_UPDATE_DATE' => $faker->dateTime(),
        'PRO_CREATE_DATE' => $faker->dateTime(),
        'PRO_CREATE_USER' => $user->USR_UID,
        'PRO_DEBUG' => 0,
        'PRO_DYNAFORMS' => serialize([]),
        'PRO_ITEE' => 1,
        'PRO_ACTION_DONE' => serialize([]),
        'PRO_CATEGORY' => function () {
            return factory(\ProcessMaker\Model\ProcessCategory::class)->create()->CATEGORY_UID;
        },
    ];
});
