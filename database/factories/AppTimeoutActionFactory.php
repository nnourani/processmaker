<?php

use Faker\Generator as Faker;

$factory->define(\ProcessMaker\Model\AppTimeoutAction::class, function (Faker $faker) {
    $index = $faker->unique()->numberBetween(20);
    return [
        'APP_UID' => G::generateUniqueID(),
        'DEL_INDEX' => $index,
        'EXECUTION_DATE' => $faker->dateTime()
    ];
});
