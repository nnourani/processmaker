<?php

use Faker\Generator as Faker;

$factory->define(\ProcessMaker\Model\ProcessUser::class, function(Faker $faker) {
    return [
        'PU_UID' => G::generateUniqueID(),
        'PRO_UID' => G::generateUniqueID(),
        'USR_UID' => G::generateUniqueID(),
        'PU_TYPE' => $faker->word
    ];
});