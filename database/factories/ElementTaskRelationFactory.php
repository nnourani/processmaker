<?php

use Faker\Generator as Faker;

$factory->define(\ProcessMaker\Model\ElementTaskRelation::class, function(Faker $faker) {
    return [
        'ETR_UID' => G::generateUniqueID(),
        'PRJ_UID' => G::generateUniqueID(),
        'ELEMENT_UID' => G::generateUniqueID(),
        'ELEMENT_TYPE' => 'bpmnEvent',
        'TAS_UID' => G::generateUniqueID(),
    ];
});
