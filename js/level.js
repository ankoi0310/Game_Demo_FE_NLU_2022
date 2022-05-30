const NUMBER_OF_LEVEL = 5;
const LIST_POINT_PER_LEVEL = [0, 5, 5, 5, 5, 5];
const BLOCK_RATE_PER_LEVEL = [0, 0, 0.2, 0.4, 0.6, 0.8];
const FOOD_TIMING_PER_LEVEL = [0, 0, 0, 1, 1, 1]; // 0 => false, 1 => true
const BLOCK_DROPDOWN = [0, 0, 1, 0, 1, 0]; // 0 => false, 1 => true

class Level {
    constructor(point, blockRate, hasFoodTiming, hasBlockDropdown) {
        this.point = point;
        this.blockRate = blockRate;
        this.hasFoodTiming = hasFoodTiming;
        this.hasBlockDropdown = hasBlockDropdown;
    }
}

export class LevelManagement {

    static createLevel() {
        const listLevel = new Map();

        for (let i = 1; i <= NUMBER_OF_LEVEL; i++) {
            listLevel.set(i, new Level(LIST_POINT_PER_LEVEL[i], BLOCK_RATE_PER_LEVEL[i], FOOD_TIMING_PER_LEVEL[i], BLOCK_DROPDOWN[i]));
        }

        return listLevel;
    }
}
