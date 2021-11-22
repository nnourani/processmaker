<?php

use Faker\Generator as Faker;

$factory->define(\ProcessMaker\Model\TaskUser::class, function(Faker $faker) {
    return [
        'TAS_UID' => function() {
            $task = factory(\ProcessMaker\Model\Task::class)->create();
            return $task->TAS_UID;
        },
        'TU_TYPE' => 1,
        'TU_RELATION' => 1
    ];
});

// Create a delegation with the foreign keys
$factory->state(\ProcessMaker\Model\TaskUser::class, 'foreign_keys', function (Faker $faker) {
    $user = factory(\ProcessMaker\Model\User::class)->create();
    $task = factory(\ProcessMaker\Model\Task::class)->create();
    return [
        'TAS_UID' => $task->TAS_UID,
        'USR_UID' => $user->USR_UID,
        'TU_TYPE' => 1,
        'TU_RELATION' => 1
    ];
});

$factory->state(\ProcessMaker\Model\TaskUser::class, 'normal_assigment_user', function (Faker $faker) {
    $user = factory(\ProcessMaker\Model\User::class)->create();
    $task = factory(\ProcessMaker\Model\Task::class)->create();
    return [
        'TAS_UID' => $task->TAS_UID,
        'USR_UID' => $user->USR_UID,
        'TU_RELATION' => 1,
        'TU_TYPE' => 1,
    ];
});

$factory->state(\ProcessMaker\Model\TaskUser::class, 'normal_assigment_group', function (Faker $faker) {
    $group = factory(\ProcessMaker\Model\Groupwf::class)->create();
    $task = factory(\ProcessMaker\Model\Task::class)->create();
    return [
        'TAS_UID' => $task->TAS_UID,
        'USR_UID' => $group->GRP_UID,
        'TU_RELATION' => 2,
        'TU_TYPE' => 1,
    ];
});

$factory->state(\ProcessMaker\Model\TaskUser::class, 'adhoc_assigment_user', function (Faker $faker) {
    $user = factory(\ProcessMaker\Model\User::class)->create();
    $task = factory(\ProcessMaker\Model\Task::class)->create();
    return [
        'TAS_UID' => $task->TAS_UID,
        'USR_UID' => $user->USR_UID,
        'TU_RELATION' => 1,
        'TU_TYPE' => 2,
    ];
});

$factory->state(\ProcessMaker\Model\TaskUser::class, 'adhoc_assigment_group', function (Faker $faker) {
    $group = factory(\ProcessMaker\Model\Groupwf::class)->create();
    $task = factory(\ProcessMaker\Model\Task::class)->create();
    return [
        'TAS_UID' => $task->TAS_UID,
        'USR_UID' => $group->GRP_UID,
        'TU_RELATION' => 2,
        'TU_TYPE' => 2,
    ];
});