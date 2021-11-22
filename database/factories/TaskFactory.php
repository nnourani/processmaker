<?php

/**
 * Model factory for a process
 */
use Faker\Generator as Faker;

$factory->define(\ProcessMaker\Model\Task::class, function(Faker $faker) {
    $process = factory(\ProcessMaker\Model\Process::class)->create();
    return [
        'PRO_UID' => $process->PRO_UID,
        'PRO_ID' => $process->PRO_ID,
        'TAS_UID' => G::generateUniqueID(),
        'TAS_TITLE' => $faker->sentence(2),
        'TAS_TYPE' => 'NORMAL',
        'TAS_TYPE_DAY' => 1,
        'TAS_DURATION' => 1,
        'TAS_ASSIGN_TYPE' => 'BALANCED',
        'TAS_DEF_TITLE' => $faker->sentence(2),
        'TAS_ASSIGN_VARIABLE' => '@@SYS_NEXT_USER_TO_BE_ASSIGNED',
        'TAS_MI_INSTANCE_VARIABLE' => '@@SYS_VAR_TOTAL_INSTANCE',
        'TAS_MI_COMPLETE_VARIABLE' => '@@SYS_VAR_TOTAL_INSTANCES_COMPLETE',
        'TAS_ASSIGN_LOCATION' => 'FALSE',
        'TAS_ASSIGN_LOCATION_ADHOC' => 'FALSE',
        'TAS_TRANSFER_FLY' => 'FALSE',
        'TAS_LAST_ASSIGNED' => 0,
        'TAS_USER' => 0,
        'TAS_CAN_UPLOAD' => 'FALSE',
        'TAS_CAN_CANCEL' => 'FALSE',
        'TAS_OWNER_APP' => 'FALSE',
        'TAS_CAN_SEND_MESSAGE' => 'FALSE',
        'TAS_SEND_LAST_EMAIL' => 'FALSE',
        'TAS_SELFSERVICE_TIMEOUT' => 0,
    ];
});

// Create a task with the foreign keys
$factory->state(\ProcessMaker\Model\Task::class, 'foreign_keys', function (Faker $faker) {
    $process = factory(\ProcessMaker\Model\Process::class)->create();
    return [
        'PRO_UID' => $process->PRO_UID,
        'PRO_ID' => $process->PRO_ID,
        'TAS_UID' => G::generateUniqueID(),
        'TAS_TITLE' => $faker->sentence(2),
        'TAS_TYPE' => 'NORMAL',
        'TAS_TYPE_DAY' => 1,
        'TAS_DURATION' => 1,
        'TAS_ASSIGN_TYPE' => 'BALANCED',
        'TAS_DEF_TITLE' => $faker->sentence(2),
        'TAS_ASSIGN_VARIABLE' => '@@SYS_NEXT_USER_TO_BE_ASSIGNED',
        'TAS_MI_INSTANCE_VARIABLE' => '@@SYS_VAR_TOTAL_INSTANCE',
        'TAS_MI_COMPLETE_VARIABLE' => '@@SYS_VAR_TOTAL_INSTANCES_COMPLETE',
        'TAS_ASSIGN_LOCATION' => 'FALSE',
        'TAS_ASSIGN_LOCATION_ADHOC' => 'FALSE',
        'TAS_TRANSFER_FLY' => 'FALSE',
        'TAS_LAST_ASSIGNED' => 0,
        'TAS_USER' => 0,
        'TAS_CAN_UPLOAD' => 'FALSE',
        'TAS_CAN_CANCEL' => 'FALSE',
        'TAS_OWNER_APP' => 'FALSE',
        'TAS_CAN_SEND_MESSAGE' => 'FALSE',
        'TAS_SEND_LAST_EMAIL' => 'FALSE',
        'TAS_SELFSERVICE_TIMEOUT' => 0,
    ];
});

// Create a task related with the self-service timeout execution
$factory->state(\ProcessMaker\Model\Task::class, 'sef_service_timeout', function (Faker $faker) {
    $timeUnit = $faker->randomElement(['MINUTES', 'HOURS', 'DAYS']);
    $execution = $faker->randomElement(['EVERY_TIME', 'ONCE']);
    return [
        'TAS_UID' => G::generateUniqueID(),
        'TAS_ID' => $faker->unique()->numberBetween(1, 200000),
        'TAS_TITLE' => $faker->sentence(2),
        'TAS_TYPE' => 'NORMAL',
        'TAS_TYPE_DAY' => 1,
        'TAS_DURATION' => 1,
        'TAS_ASSIGN_TYPE' => 'SELF_SERVICE',
        'TAS_ASSIGN_VARIABLE' => '@@SYS_NEXT_USER_TO_BE_ASSIGNED',
        'TAS_SELFSERVICE_TIMEOUT' => 1,
        'TAS_SELFSERVICE_TIME' => $faker->unique()->numberBetween(1, 24),
        'TAS_SELFSERVICE_TIME_UNIT' => $timeUnit,
        'TAS_SELFSERVICE_TRIGGER_UID' => function() {
            return $trigger = factory(\ProcessMaker\Model\Triggers::class)->create()->TRI_UID;
        },
        'TAS_SELFSERVICE_EXECUTION' => $execution,
    ];
});
