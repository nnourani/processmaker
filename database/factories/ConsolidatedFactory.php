<?php

use Faker\Generator as Faker;

$factory->define(\ProcessMaker\Model\Consolidated::class, function (Faker $faker) {
    return [
        'TAS_UID' => G::generateUniqueID(),
        'DYN_UID' => G::generateUniqueID(),
        'REP_TAB_UID' => G::generateUniqueID(),
        'CON_STATUS' => 'ACTIVE',
    ];
});

// Create a consolidated task with the foreign keys
$factory->state(\ProcessMaker\Model\Consolidated::class, 'foreign_keys', function (Faker $faker) {
    $task = factory(\ProcessMaker\Model\Task::class)->create();
    $dynaform = factory(\ProcessMaker\Model\Dynaform::class)->create();
    return [
        'TAS_UID' => $task->TAS_UID,
        'DYN_UID' => $dynaform->DYN_UID,
        'REP_TAB_UID' => G::generateUniqueID(),
        'CON_STATUS' => 'ACTIVE',
    ];
});