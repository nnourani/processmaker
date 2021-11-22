<?php

use Faker\Generator as Faker;

$factory->define(\ProcessMaker\Model\AppDelay::class, function (Faker $faker) {
    $actions = ['CANCEL', 'PAUSE', 'REASSIGN'];
    return [
        'APP_DELAY_UID' => G::generateUniqueID(),
        'PRO_UID' => G::generateUniqueID(),
        'APP_UID' => G::generateUniqueID(),
        'APP_NUMBER' => $faker->unique()->numberBetween(1000),
        'APP_THREAD_INDEX' => $faker->unique()->numberBetween(100),
        'APP_DEL_INDEX' => $faker->unique()->numberBetween(100),
        'APP_TYPE' => $faker->randomElement($actions),
        'APP_STATUS' => 'TO_DO',
        'APP_NEXT_TASK' => 0,
        'APP_DELEGATION_USER' => G::generateUniqueID(),
        'APP_ENABLE_ACTION_USER' => G::generateUniqueID(),
        'APP_ENABLE_ACTION_DATE' => $faker->dateTime(),
        'APP_DISABLE_ACTION_USER' => G::generateUniqueID(),
        'APP_DISABLE_ACTION_DATE' => $faker->dateTime(),
        'APP_AUTOMATIC_DISABLED_DATE' => '',
        'APP_DELEGATION_USER_ID' => $faker->unique()->numberBetween(1000),
        'PRO_ID' => $faker->unique()->numberBetween(1000),
    ];
});

// Create a delegation with the foreign keys
$factory->state(\ProcessMaker\Model\AppDelay::class, 'paused_foreign_keys', function (Faker $faker) {
    // Create values in the foreign key relations
    $delegation1 = factory(\ProcessMaker\Model\Delegation::class)->states('closed')->create();
    $delegation2 = factory(\ProcessMaker\Model\Delegation::class)->states('foreign_keys')->create([
        'PRO_UID' => $delegation1->PRO_UID,
        'PRO_ID' => $delegation1->PRO_ID,
        'TAS_UID' => $delegation1->TAS_UID,
        'TAS_ID' => $delegation1->TAS_ID,
        'APP_NUMBER' => $delegation1->APP_NUMBER,
        'APP_UID' => $delegation1->APP_UID,
        'DEL_THREAD_STATUS' => 'OPEN',
        'USR_UID' => $delegation1->USR_UID,
        'USR_ID' => $delegation1->USR_ID,
        'DEL_PREVIOUS' => $delegation1->DEL_INDEX,
        'DEL_INDEX' => $faker->unique()->numberBetween(2000),
    ]);

    // Return with default values
    return [
        'APP_DELAY_UID' => G::generateUniqueID(),
        'PRO_UID' => $delegation2->PRO_UID,
        'PRO_ID' => $delegation2->PRO_ID,
        'APP_UID' => $delegation2->APP_UID,
        'APP_NUMBER' => $delegation2->APP_NUMBER,
        'APP_DEL_INDEX' => $delegation2->DEL_INDEX,
        'APP_TYPE' => 'PAUSE',
        'APP_STATUS' => 'TO_DO',
        'APP_DELEGATION_USER' => $delegation2->USR_UID,
        'APP_DELEGATION_USER_ID' => $delegation2->USR_ID,
        'APP_ENABLE_ACTION_USER' => G::generateUniqueID(),
        'APP_ENABLE_ACTION_DATE' => $faker->dateTime(),
        'APP_DISABLE_ACTION_USER' => 0,
    ];
});
