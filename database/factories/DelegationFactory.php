<?php

use Faker\Generator as Faker;

$factory->define(\ProcessMaker\Model\Delegation::class, function(Faker $faker) {
    $user = factory(\ProcessMaker\Model\User::class)->create();
    $process = factory(\ProcessMaker\Model\Process::class)->create();
    $task = factory(\ProcessMaker\Model\Task::class)->create([
        'PRO_UID' => $process->PRO_UID,
        'PRO_ID' => $process->PRO_ID
    ]);
    $application = factory(\ProcessMaker\Model\Application::class)->create([
        'PRO_UID' => $process->PRO_UID,
        'APP_INIT_USER' => $user->USR_UID,
        'APP_CUR_USER' => $user->USR_UID
    ]);
    // Return with default values
    return [
        'DELEGATION_ID' => $faker->unique()->numberBetween(5000),
        'APP_UID' => $application->APP_UID,
        'DEL_INDEX' => 1,
        'APP_NUMBER' => $application->APP_NUMBER,
        'DEL_PREVIOUS' => 0,
        'PRO_UID' => $process->PRO_UID,
        'TAS_UID' => $task->TAS_UID,
        'USR_UID' => $user->USR_UID,
        'DEL_TYPE' => 'NORMAL',
        'DEL_THREAD' => 1,
        'DEL_THREAD_STATUS' => 'OPEN',
        'DEL_PRIORITY' => 3,
        'DEL_DELEGATE_DATE' => $faker->dateTime(),
        'DEL_INIT_DATE' => $faker->dateTime(),
        'DEL_TASK_DUE_DATE' => $faker->dateTime(),
        'DEL_RISK_DATE' => $faker->dateTime(),
        'DEL_LAST_INDEX' => 0,
        'USR_ID' => $user->USR_ID,
        'PRO_ID' => $process->PRO_ID,
        'TAS_ID' => $task->TAS_ID,
        'DEL_DATA' => '',
        'DEL_TITLE' => $faker->word()
    ];
});

// Create a delegation with the foreign keys
$factory->state(\ProcessMaker\Model\Delegation::class, 'foreign_keys', function (Faker $faker) {
    // Create values in the foreign key relations
    $user = factory(\ProcessMaker\Model\User::class)->create();
    $category = factory(\ProcessMaker\Model\ProcessCategory::class)->create();
    $process = factory(\ProcessMaker\Model\Process::class)->create([
        'PRO_CATEGORY' => $category->CATEGORY_UID,
        'CATEGORY_ID' => $category->CATEGORY_ID
    ]);
    $task = factory(\ProcessMaker\Model\Task::class)->create([
        'PRO_UID' => $process->PRO_UID,
        'PRO_ID' => $process->PRO_ID
    ]);
    $application = factory(\ProcessMaker\Model\Application::class)->create([
        'PRO_UID' => $process->PRO_UID,
        'APP_INIT_USER' => $user->USR_UID,
        'APP_CUR_USER' => $user->USR_UID
    ]);

    $delegateDate = $faker->dateTime();
    $initDate = $faker->dateTimeInInterval($delegateDate, '+30 minutes');
    $riskDate = $faker->dateTimeInInterval($initDate, '+1 day');
    $taskDueDate = $faker->dateTimeInInterval($riskDate, '+2 day');

    // Return with default values
    return [
        'DELEGATION_ID' => $faker->unique()->numberBetween(5000),
        'APP_UID' => $application->APP_UID,
        'DEL_INDEX' => $faker->unique()->numberBetween(2000),
        'APP_NUMBER' => $application->APP_NUMBER,
        'DEL_PREVIOUS' => 0,
        'PRO_UID' => $process->PRO_UID,
        'TAS_UID' => $task->TAS_UID,
        'USR_UID' => $user->USR_UID,
        'DEL_TYPE' => 'NORMAL',
        'DEL_THREAD' => 1,
        'DEL_THREAD_STATUS' => 'OPEN',
        'DEL_PRIORITY' => 3,
        'DEL_DELEGATE_DATE' => $delegateDate,
        'DEL_INIT_DATE' => $initDate,
        'DEL_TASK_DUE_DATE' => $taskDueDate,
        'DEL_RISK_DATE' => $riskDate,
        'DEL_LAST_INDEX' => 1,
        'USR_ID' => $user->USR_ID,
        'PRO_ID' => $process->PRO_ID,
        'TAS_ID' => $task->TAS_ID,
        'DEL_DATA' => '',
        'DEL_TITLE' => $faker->word()
    ];
});

// Create a delegation with the foreign keys
$factory->state(\ProcessMaker\Model\Delegation::class, 'web_entry', function (Faker $faker) {
    // Create values in the foreign key relations
    $user = factory(\ProcessMaker\Model\User::class)->create();
    $category = factory(\ProcessMaker\Model\ProcessCategory::class)->create();
    $process = factory(\ProcessMaker\Model\Process::class)->create([
        'PRO_CATEGORY' => $category->CATEGORY_UID,
        'CATEGORY_ID' => $category->CATEGORY_ID
    ]);
    $task = factory(\ProcessMaker\Model\Task::class)->create([
        'PRO_UID' => $process->PRO_UID,
        'PRO_ID' => $process->PRO_ID
    ]);
    $application = factory(\ProcessMaker\Model\Application::class)->states('web_entry')->create([
        'PRO_UID' => $process->PRO_UID,
        'APP_INIT_USER' => $user->USR_UID,
        'APP_CUR_USER' => $user->USR_UID
    ]);

    // Return with default values
    return [
        'DELEGATION_ID' => $faker->unique()->numberBetween(5000),
        'APP_UID' => $application->APP_UID,
        'DEL_INDEX' => 1,
        'APP_NUMBER' => $application->APP_NUMBER,
        'DEL_PREVIOUS' => 0,
        'PRO_UID' => $process->PRO_UID,
        'TAS_UID' => $task->TAS_UID,
        'USR_UID' => $user->USR_UID,
        'DEL_TYPE' => 'NORMAL',
        'DEL_THREAD' => 1,
        'DEL_THREAD_STATUS' => 'OPEN',
        'DEL_PRIORITY' => 3,
        'DEL_DELEGATE_DATE' => $faker->dateTime(),
        'DEL_INIT_DATE' => $faker->dateTime(),
        'DEL_TASK_DUE_DATE' => $faker->dateTime(),
        'DEL_RISK_DATE' => $faker->dateTime(),
        'USR_ID' => $user->USR_ID,
        'PRO_ID' => $process->PRO_ID,
        'TAS_ID' => $task->TAS_ID,
        'DEL_DATA' => '',
        'DEL_TITLE' => $faker->word()
    ];
});

// Create a open delegation
$factory->state(\ProcessMaker\Model\Delegation::class, 'open', function (Faker $faker) {
    // Create dates with sense
    $delegateDate = $faker->dateTime();
    $initDate = $faker->dateTimeInInterval($delegateDate, '+30 minutes');
    $riskDate = $faker->dateTimeInInterval($initDate, '+1 day');
    $taskDueDate = $faker->dateTimeInInterval($riskDate, '+2 day');

    return [
        'DEL_THREAD_STATUS' => 'OPEN',
        'DEL_DELEGATE_DATE' => $delegateDate,
        'DEL_INIT_DATE' => $initDate,
        'DEL_RISK_DATE' => $riskDate,
        'DEL_TASK_DUE_DATE' => $taskDueDate,
        'DEL_FINISH_DATE' => null
    ];
});

// Create a closed delegation
$factory->state(\ProcessMaker\Model\Delegation::class, 'closed', function (Faker $faker) {
    // Create dates with sense
    $delegateDate = $faker->dateTime();
    $initDate = $faker->dateTimeInInterval($delegateDate, '+30 minutes');
    $riskDate = $faker->dateTimeInInterval($initDate, '+1 day');
    $taskDueDate = $faker->dateTimeInInterval($riskDate, '+2 day');
    $finishDate = $faker->dateTimeInInterval($initDate, '+10 days');

    return [
        'DEL_THREAD_STATUS' => 'CLOSED',
        'DEL_DELEGATE_DATE' => $delegateDate,
        'DEL_INIT_DATE' => $initDate,
        'DEL_RISK_DATE' => $riskDate,
        'DEL_TASK_DUE_DATE' => $taskDueDate,
        'DEL_FINISH_DATE' => $finishDate
    ];
});

// Create a last delegation
$factory->state(\ProcessMaker\Model\Delegation::class, 'last_thread', function (Faker $faker) {

    return [
        'DEL_LAST_INDEX' => 1,
    ];
});

// Create a first delegation
$factory->state(\ProcessMaker\Model\Delegation::class, 'first_thread', function (Faker $faker) {

    return [
        'DEL_INDEX' => 1,
        'DEL_PREVIOUS' => 0,
    ];
});
