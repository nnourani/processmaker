<?php

use Faker\Generator as Faker;

$factory->define(\ProcessMaker\Model\Application::class, function(Faker $faker) {
    $user = factory(\ProcessMaker\Model\User::class)->create();
    $appNumber = $faker->unique()->numberBetween(1000);
    // APP_TITLE field is used in 'MYSQL: MATCH() AGAINST()' function, string size should not be less than 3.
    $appTitle = $faker->lexify(str_repeat('?', rand(3, 5)) . ' ' . str_repeat('?', rand(3, 5)));
    return [
        'APP_UID' => G::generateUniqueID(),
        'APP_TITLE' => $appTitle,
        'APP_DESCRIPTION' => $faker->text,
        'APP_NUMBER' => $appNumber,
        'APP_STATUS' => 'TO_DO',
        'APP_STATUS_ID' => 2,
        'PRO_UID' => function() {
            return factory(\ProcessMaker\Model\Process::class)->create()->PRO_UID;
        },
        'APP_PROC_STATUS' => '',
        'APP_PROC_CODE' => '',
        'APP_PARALLEL' => 'N',
        'APP_INIT_USER' => $user->USR_UID,
        'APP_CUR_USER' => $user->USR_UID,
        'APP_PIN' => G::generateUniqueID(),
        'APP_CREATE_DATE' => $faker->dateTimeBetween('now', '+30 minutes'),
        'APP_INIT_DATE' => $faker->dateTimeBetween('now', '+30 minutes'),
        'APP_UPDATE_DATE' => $faker->dateTimeBetween('now', '+30 minutes'),
        'APP_FINISH_DATE' => $faker->dateTimeBetween('now', '+30 minutes'),
        'APP_DATA' => serialize(['APP_NUMBER' => $appNumber])
    ];
});

// Create a delegation with the foreign keys
$factory->state(\ProcessMaker\Model\Application::class, 'foreign_keys', function (Faker $faker) {
    // Create values in the foreign key relations
    $process = factory(\ProcessMaker\Model\Process::class)->create();
    $user = factory(\ProcessMaker\Model\User::class)->create();
    $appNumber = $faker->unique()->numberBetween(1000);

    // APP_TITLE field is used in 'MYSQL: MATCH() AGAINST()' function, string size should not be less than 3.
    $appTitle = $faker->lexify(str_repeat('?', rand(3, 5)) . ' ' . str_repeat('?', rand(3, 5)));

    $statuses = ['DRAFT', 'TO_DO', 'COMPLETED', 'CANCELLED'];
    $status = $faker->randomElement($statuses);
    $statusId = array_search($status, $statuses) + 1;

    return [
        'APP_UID' => G::generateUniqueID(),
        'APP_TITLE' => $appTitle,
        'APP_NUMBER' => $appNumber,
        'APP_STATUS' => $status,
        'APP_STATUS_ID' => $statusId,
        'PRO_UID' => $process->PRO_UID,
        'APP_PROC_STATUS' => '',
        'APP_PROC_CODE' => '',
        'APP_PARALLEL' => 'N',
        'APP_INIT_USER' => $user->USR_UID,
        'APP_INIT_USER_ID' => $user->USR_ID,
        'APP_CUR_USER' => $user->USR_UID,
        'APP_PIN' => G::generateUniqueID(),
        'APP_CREATE_DATE' => $faker->dateTime(),
        'APP_INIT_DATE' => $faker->dateTime(),
        'APP_UPDATE_DATE' => $faker->dateTime(),
        'APP_FINISH_DATE' => $faker->dateTime(),
        'APP_DATA' => serialize(['APP_NUMBER' => $appNumber])
    ];
});

$factory->state(\ProcessMaker\Model\Application::class, 'web_entry', function (Faker $faker) {
    $appNumber = $faker->unique()->numberBetween(5000);
    return [
        'APP_NUMBER' => $appNumber * -1,
        'APP_STATUS_ID' => 2,
        'APP_STATUS' => 'TO_DO'
    ];
});

$factory->state(\ProcessMaker\Model\Application::class, 'todo', function (Faker $faker) {
    return [
        'APP_NUMBER' => $faker->unique()->numberBetween(1000),
        'APP_STATUS_ID' => 2,
        'APP_STATUS' => 'TO_DO'
    ];
});

$factory->state(\ProcessMaker\Model\Application::class, 'draft', function (Faker $faker) {
    $user = factory(\ProcessMaker\Model\User::class)->create();

    return [
        'APP_NUMBER' => $faker->unique()->numberBetween(1000),
        'APP_STATUS_ID' => 1,
        'APP_STATUS' => 'DRAFT',
        'APP_INIT_USER' => $user->USR_UID,
        'APP_INIT_USER_ID' => $user->USR_ID,
    ];
});

$factory->state(\ProcessMaker\Model\Application::class, 'completed', function (Faker $faker) {
    return [
        'APP_NUMBER' => $faker->unique()->numberBetween(1000),
        'APP_STATUS_ID' => 3,
        'APP_STATUS' => 'COMPLETED'
    ];
});

$factory->state(\ProcessMaker\Model\Application::class, 'canceled', function (Faker $faker) {
    return [
        'APP_NUMBER' => $faker->unique()->numberBetween(1000),
        'APP_STATUS_ID' => 4,
        'APP_STATUS' => 'CANCELLED'
    ];
});

$factory->state(\ProcessMaker\Model\Application::class, 'draft_minor_case', function (Faker $faker) {
    $caseNumber = $faker->unique()->numberBetween(1, 1000);
    return [
        'APP_NUMBER' => $caseNumber,
        'APP_TITLE' => 'Case # ' . $caseNumber,
        'APP_STATUS_ID' => 1,
        'APP_STATUS' => 'DRAFT',
        'APP_UPDATE_DATE' => $faker->dateTimeBetween('-2 year', '-1 year')
    ];
});

$factory->state(\ProcessMaker\Model\Application::class, 'draft_major_case', function (Faker $faker) {
    $caseNumber = $faker->unique()->numberBetween(2000, 3000);
    return [
        'APP_NUMBER' => $caseNumber,
        'APP_TITLE' => 'Case # ' . $caseNumber,
        'APP_STATUS_ID' => 1,
        'APP_STATUS' => 'DRAFT',
        'APP_UPDATE_DATE' => $faker->dateTimeBetween('now', '+1 year')
    ];
});
