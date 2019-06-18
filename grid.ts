//% weight=0 color=#b8860b icon="\uf009" block="Grid"
//% groups=['Grid', 'Sprites', 'other']
//% advanced=true
namespace grid {
    export interface Coordinate {
        column: number
        row: number
    }   // interface Coordinate

    interface Dimension {
        count: number
        min: number
        max: number
        pixels: number
    }   // interface Dimension

    export interface Pixel {
        x: number
        y: number
    }   // interface Pixel

    interface SpriteInfo {
        col: number
        id: number
        isMoving: boolean
        row: number
        sprite: Sprite
        target: Pixel
    }   // interface SpriteInfo

    class ControlGrid {
        private static readonly DEFAULT_SIZE = 4
        private static readonly DEFAULT_SPRITE_SPEED = 100

        private _colInfo: Dimension
        private _rowInfo: Dimension
        private _spriteIds: number[]
        private _spriteInfo: SpriteInfo[]
        private _spriteVelocity: number
        private _wrap: boolean

        /**
         * Default constructor
         */
        constructor() {
            this._spriteIds = []
            this._spriteInfo = []
            this._spriteVelocity = ControlGrid.DEFAULT_SPRITE_SPEED
            this._wrap = false
            this.setSize(ControlGrid.DEFAULT_SIZE, ControlGrid.DEFAULT_SIZE)
        }   // constructor()

        /**
         * Getters and setters
         */
        /**
         * @return {number} Velocity at which sprites move when animating.
         */
        public get velocity(): number {
            return this._spriteVelocity
        }   // get velocity()

        /**
         * @param {number} value - Velocity at which sprites will move when animating.
         */
        public set velocity(value: number) {
            if (value > 0) {
                this._spriteVelocity = value
            }   // if (value)
        }   // set velocity()

        /**
         * @return {boolean} Whether sprites will wrap around the grid.
         *                   True = wrap around, False = Sprites stop at grid boundaries.
         */
        public get wrapAround(): boolean {
            return this._wrap
        }   // get wrapAround()

        /**
         * @param {boolean} value - Whether sprites will wrap around the grid.
         *                          True = wrap around, False = Sprites stop at grid boundaries.
         */
        public set wrapAround(value: boolean) {
            this._wrap = value
        }   // set wrapAround()

        /**
         * Public methods
         */
        /**
         * Draw the current grid on the provided image.
         * @param {Image} img - Drawing canvas on which grid will be drawn.
         * @param {number} color - Color to use when drawing grid.
         */
        public drawGrid(img: Image, color: number): void {
            for (let row: number = 1; row <= this._rowInfo.count; row++) {
                let y: number = row * this._rowInfo.pixels
                img.drawLine(0, y, screen.width, y, color)
            }   // for (row)

            for (let col: number = 1; col <= this._colInfo.count; col++) {
                let x: number = col * this._colInfo.pixels
                img.drawLine(x, 0, x, screen.height, color)
            }   // for (col)
        }   // drawGrid()

        /**
         * Return an image with the current grid.
         * @param {number} color - Color to use when drawing grid.
         * @return {Image} Image with current grid drawn on it.
         */
        public getGrid(color: number): Image {
            let toReturn = image.create(screen.width, screen.height)
            this.drawGrid(toReturn, color)
            return toReturn
        }   // getGrid()

        /**
         * @param {Coordinate} coordinate - Coordinate to translate.
         * @return {Pixel} Equivalent screen pixel.
         */
        public getPixel(coordinate: Coordinate): Pixel {
            return {
                x: this._colInfo.pixels * (coordinate.column + 1),
                y: this._rowInfo.pixels * (coordinate.row + 1)
            }
        }   // getPixel()

        /**
         * @param {Sprite} sprite - Sprite to query.
         * @return {Coordinate} Last-known coordinate for sprite.
         */
        public getSpriteLocation(sprite: Sprite): Coordinate {
            let index: number = this._spriteIds.indexOf(sprite.id)
            if (index > -1) {
                let si: SpriteInfo = this._spriteInfo[index]
                return {
                    column: si.col,
                    row: si.row
                }
            } else {
                return null
            }   // if (index)
        }   // getSpriteLocation()

        /**
         * @param {Sprite} sprite - Sprite to move.
         * @param {number} rowChange - Number of rows to move sprite. Positive moves up; negative, down.
         * @param {number} columnChange - Number of columns to move sprite. Positive moves to the right; negative, to the left.
         * @param {boolean} jump - Whether to "teleport" or "slide" the sprite. True = teleport, false = slide.
         * @return {boolean} Whether move was successful.
         */
        public moveSprite(sprite: Sprite, rowChange: number = 0, columnChange: number = 0, jump: boolean = true): boolean {
            if (!sprite) {
                return false
            }   // if (! sprite)
            let index: number = this.findSprite(sprite)
            let si: SpriteInfo = this._spriteInfo[index]
            let newCol: number = si.col + columnChange
            let newRow: number = si.row + rowChange
            if (newCol < this._colInfo.min || newCol > this._colInfo.max) {
                if (this._wrap) {
                    if (newCol < this._colInfo.min) {
                        newCol = this._colInfo.max
                    } else {
                        newCol = this._colInfo.min
                    }   // if (newCol < this._colInfo.min)
                } else {
                    return false
                }   // if (this._wrap)
            }   // if (newCol < this._colInfo.min || ...)

            if (newRow < this._rowInfo.min || newRow > this._rowInfo.max) {
                if (this._wrap) {
                    if (newRow < this._rowInfo.min) {
                        newRow = this._rowInfo.max
                    } else {
                        newRow = this._rowInfo.min
                    }   // if (newRow < this._rowInfo.min)
                } else {
                    return false
                }   // if (this._wrap)
            }   // if (newRow < this._rowInfo.min || ...)

            this.moveSpriteToCoordinate(index, { row: newRow, column: newCol }, jump, false)
            return true
        }   // moveSprite()

        /**
         * @param {number} min - Smallest permitted value for columns. Null = 0.
         * @param {number} max - Largest permitted value for columns. Null = last column that is on-screen.
         */
        public setColRange(min?: number, max?: number): void {
            this.setRange(this._colInfo, min, max)
        }   // setColRange()

        /**
         * @param {number} min - Smallest permitted value for rows. Null = 0.
         * @param {number} max - Largest permitted value for rows. Null = last row that is on-screen.
         */
        public setRowRange(min?: number, max?: number): void {
            this.setRange(this._rowInfo, min, max)
        }   // setRowRange()

        /**
         * Set the size of the grid.
         * @param {number} rows - Number of rows in the grid.
         * @param {number} columns - Number of columns in the grid.
         * @return {boolean} Whether grid size was set successfully.
         */
        public setSize(rows: number, columns: number): boolean {
            if (rows > 0 && columns > 0) {
                this._colInfo = {
                    count: columns,
                    max: columns - 1,
                    min: 0,
                    pixels: 0
                }
                this._rowInfo = {
                    count: rows,
                    max: rows - 1,
                    min: 0,
                    pixels: 0
                }
                this.calcWidths()
                return true
            } else {
                return false
            }   // if (rows && columns)
        }   // setSize()

        /**
         * @param {Sprite} sprite - Sprite to place on the grid.
         * @param {number} row - Row in which to place sprite.
         * @param {number} column - Column in which to place sprite.
         * @param {boolean} jump - Whether to "teleport" or "slide" sprite to location. True = teleport; false = slide.
         * @param {boolean} force - Whether to ignore row and column boundaries.
         *                          True = ignore range settings; false = honor range settings.
         * @return {boolean} Whether sprite was successfully placed on grid.
         */
        public setSprite(sprite: Sprite, row: number, column: number, jump: boolean = true, force: boolean = false): boolean {
            if (sprite) {
                let index: number = this.findSprite(sprite)
                if (force) {
                    this.moveSpriteToCoordinate(index, { row: row, column: column }, jump, true)
                    return true
                } else {
                    if (row >= this._rowInfo.min && row <= this._rowInfo.max && column >= this._colInfo.min && column <= this._colInfo.max) {
                        this.moveSpriteToCoordinate(index, { row: row, column: column }, jump, true)
                        return true
                    } else {
                        return false
                    }   // if (row >= this._rowInfo.min && ...)
                }   // if (force)
            } else {
                return false
            }   // if (sprite)
        }   // setSpriteLocation()

        /**
         * Stops moving sprites if they have arrived at target location.
         * Call from game.onUpdate()
         */
        public updateSprites(): void {
            this._spriteInfo.forEach(function (value: SpriteInfo, index: number) {
                if (value.isMoving) {
                    let target: Pixel = value.target
                    let sprite = value.sprite
                    if (
                        sprite.x >= target.x && sprite.vx > 0 ||
                        sprite.x <= target.x && sprite.vx < 0 ||
                        sprite.y >= target.y && sprite.vy > 0 ||
                        sprite.y <= target.y && sprite.vy < 0
                    ) {
                        sprite.vx = 0
                        sprite.vy = 0
                        sprite.x = value.target.x
                        sprite.y = value.target.y
                        value.isMoving = false
                    }   // if (sprite.x >= target.x && sprite.vx > 0 || ...)
                }   // if (value.isMoving)
            })  // this._spriteInfo.forEach()
        }   // updateSprites()

        /**
         * Private methods
         */
        /**
         * Update dimensions with screen information.
         */
        private calcWidths(): void {
            this._colInfo.pixels = screen.width / (this._colInfo.count + 1)
            this._rowInfo.pixels = screen.height / (this._rowInfo.count + 1)
        }   // calcWidths()

        /**
         * Find a sprite or add it to the trackers.
         * @param {Sprite} sprite - Sprite to find or add.
         * @return {number} Index of sprite in tracking arrays.
         */
        private findSprite(sprite: Sprite): number {
            let toReturn = this._spriteIds.indexOf(sprite.id)
            if (toReturn === -1) {
                let si: SpriteInfo = {
                    col: 0,
                    id: sprite.id,
                    isMoving: false,
                    row: 0,
                    sprite: sprite,
                    target: null
                }
                this._spriteIds.push(sprite.id)
                this._spriteInfo.push(si)
                return this._spriteIds.length - 1
            } else {
                return toReturn
            }   // if (! toReturn)
        }   // findSprite()

        /**
         * @param {number} index - Index in tracking arrays of sprite to move.
         * @param {Coordinate} target - Target location for sprite.
         * @param {boolean} jump - Whether to "teleport" or "slide" sprite. True = teleport; falce = slide.
         * @param {boolean} force - Whether to ignore row and column boundaries.
         *                          True = ignore range settings; false = honor range settings.
         */
        private moveSpriteToCoordinate(index: number, target: Coordinate, jump: boolean = true, force: boolean = true): void {
            let si: SpriteInfo = this._spriteInfo[index]
            let endPixel: Pixel = this.getPixel(target)
            if (jump) {
                if (target.column !== si.col || force) {
                    si.col = target.column
                    si.sprite.x = endPixel.x
                }   // if (target.column !== si.col)
                if (target.row !== si.row || force) {
                    si.row = target.row
                    si.sprite.y = endPixel.y
                }   // if (target.row !== si.row)
                si.target = endPixel
                if (si.isMoving) {
                    this.setVelocity(index)
                }   // if (si.isMoving)
            } else {
                si.col = target.column
                si.row = target.row
                si.target = endPixel
                this.setVelocity(index)
                si.isMoving = true
            }   // if (jump)
        }   // moveSpriteToPixel()

        /**
         * Update a dimension with range settings.
         * @param {Dimension} dimension - Dimension to update.
         * @param {number} min - Minimum permitted value. Null = 0.
         * @param {number} max - Maximum permitted value. Null = last value that is on-screen.
         */
        private setRange(dimension: Dimension, min?: number, max?: number): void {
            if (min == null) {
                min = 0
            }   // if (! min)
            if (max == null || max > dimension.count) {
                max = dimension.count - 1
            }   // if (! max || ...)
            dimension.min = min
            dimension.max = max
        }   // setRange()

        /**
         * Update the velocity for a sprite. Use when the target of a moving sprite has changed.
         * @param {number} index - Index in tracking arrays of sprite to update.
         */
        private setVelocity(index: number): void {
            let si: SpriteInfo = this._spriteInfo[index]
            let sprite: Sprite = si.sprite
            let target: Pixel = si.target
            let dir: number = Vector.rad2deg(Math.atan2(target.y - sprite.y, target.x - sprite.x))
            let v: Vector = new Vector(this._spriteVelocity, dir)
            sprite.vx = v.x
            sprite.vy = v.y
        }   // setVelocity()
    }   // class ControlGrid

    class Vector {
        private _r: number
        private _theta: number // angle in radians
        private _dir: number // angle in degrees
        private _x: number
        private _y: number

        /**
         * Default constructor
         */
        constructor(mag: number, dir: number) {
            this._r = mag
            // Set remainder of private members
            this.dir = dir
        }   // constructor(number, number)

        /**
         * Getters and setters
         */
        /**
         * @return {number} Direction of vector in degrees.
         */
        public get dir(): number {
            return this._dir
        }   // get dir()

        /**
         * @param {number} value - Direction of vector in degrees.
         */
        public set dir(value: number) {
            this._dir = value
            this._theta = Vector.deg2rad(value)
            this._x = this._r * Math.cos(this._theta)
            this._y = this._r * Math.sin(this._theta)
        }   // set dir()

        /**
         * @return {number} Magnitude (length, size) of vector.
         */
        public get mag(): number {
            return this._r
        }   // get mag()

        /**
         * @param {number} value - Magnitude of vector.
         */
        public set mag(value: number) {
            this._r = value
            this._x = this._r * Math.cos(this._theta)
            this._y = this._r * Math.sin(this._theta)
        }   // set mag()

        /**
         * @return {number} Horizontal distance of vector in the Cartesian plane.
         */
        public get x(): number {
            return this._x
        }   // get x()

        /**
         * @return {number} Vertical distance of vector in the Cartesian plane.
         */
        public get y(): number {
            return this._y
        }   // get y()

        /**
         * Public methods
         */
        /**
         * @param {number} angle - Angle to convert in degrees.
         * @return {number} Equivalent angle in radians.
         */
        public static deg2rad(angle: number): number {
            return angle * Math.PI / 180;
        }   // deg2rad()

        /**
         * @param {number} theta - Angel to convert in radians.
         * @return {number} Equivalent angle in degrees.
         */
        public static rad2deg(theta: number): number {
            return theta * 180 / Math.PI;
        }   // rad2deg
    }   // class Vector

    let grid: ControlGrid = new ControlGrid()
    game.onUpdate(function () {
        grid.updateSprites()
    })  // game.onUpdate()

    /**
     * Whether to allow sprite to wrap around the grid.
     * @param {boolean} on - True = allow sprites to wrap; False = sprites stop at boundaries.
     */
    //% blockId="grid_allowWrap"
    //% block="allow sprites to wrap around grid %on"
    //% on.shadow="toggleOnOff" on.defl=false
    //% group="Grid" weight=10
    export function allowWrap(on: boolean): void {
        grid.wrapAround = on
    }   // allowWrap()

    /**
     * Draw a grid on the provided image.
     * @param {Image} img - Drawing canvas.
     * @param {number} color - Color to use for drawing the grid.
     */
    //% blockId="grid_drawGrid"
    //% block="draw grid|on image %img|in color %color=colorindexpicker"
    //% img.defl="myImage" img.shadow="variables_get" color.defl=1
    //% img.fieldOptions.decompileIndirectFixedInstances="true"
    //% group="Grid" weight=0
    export function drawGrid(img: Image, color: number): void {
        grid.drawGrid(img, color)
    }   // drawGrid()

    /**
     * @param {Sprite} sprite - Sprite of interest.
     * @return {number} Last-known column of sprite.
     */
    export function getSpriteColumn(sprite: Sprite): number {
        return grid.getSpriteLocation(sprite).column
    }   // getSpriteColumn()

    /**
     * @param {Sprite} sprite - Sprite of interest.
     * @return {number} Last-known row of sprite.
     */
    export function getSpriteRow(sprite: Sprite): number {
        return grid.getSpriteLocation(sprite).row
    }   // getSpriteRow()

    /**
     * Move a sprite one row down on the grid.
     * @param {Sprite} sprite - Sprite to move.
     * @param {boolean} jump - Whether to "teleport" or "slide" the sprite.
     *                         True = teleport, false = slide.
     */
    //% blockId="grid_moveDown"
    //% block="move sprite %sprite down||with teleport %jump"
    //% sprite.defl="mySprite" sprite.shadow="variables_get"
    //% jump.defl=true jump.shadow="toggleYesNo"
    //% group="Sprites" weight=59
    export function moveDown(sprite: Sprite, jump: boolean = true): void {
        grid.moveSprite(sprite, 1, 0, jump)
    }   // moveDown()

    /**
     * Move a sprite one column to the left on the grid.
     * @param {Sprite} sprite - Sprite to move.
     * @param {boolean} jump - Whether to "teleport" or "slide" the sprite.
     *                         True = teleport, false = slide.
     */
    //% blockId="grid_moveLeft"
    //% block="move sprite %sprite left||with teleport %jump"
    //% sprite.defl="mySprite" sprite.shadow="variables_get"
    //% jump.defl=true jump.shadow="toggleYesNo"
    //% group="Sprites" weight=58
    export function moveLeft(sprite: Sprite, jump: boolean = true): void {
        grid.moveSprite(sprite, 0, -1, jump)
    }   // moveLeft()

    /**
     * Move a sprite one column to the right on the grid.
     * @param {Sprite} sprite - Sprite to move.
     * @param {boolean} jump - Whether to "teleport" or "slide" the sprite.
     *                         True = teleport, false = slide.
     */
    //% blockId="grid_moveRight"
    //% block="move sprite %sprite right||with teleport %jump"
    //% sprite.defl="mySprite" sprite.shadow="variables_get"
    //% jump.defl=true jump.shadow="toggleYesNo"
    //% group="Sprites" weight=57
    export function moveRight(sprite: Sprite, jump: boolean = true): void {
        grid.moveSprite(sprite, 0, 1, jump)
    }   // moveRight()

    /**
     * Move a sprite one row up on the grid.
     * @param {Sprite} sprite - Sprite to move.
     * @param {boolean} jump - Whether to "teleport" or "slide" the sprite.
     *                         True = teleport, false = slide.
     */
    //% blockId="grid_moveUp"
    //% block="move sprite %sprite up||with teleport %jump"
    //% sprite.defl="mySprite" sprite.shadow="variables_get"
    //% jump.defl=true jump.shadow="toggleYesNo"
    //% group="Sprites" weight=56
    export function moveUp(sprite: Sprite, jump: boolean = true): void {
        grid.moveSprite(sprite, -1, 0, jump)
    }   // moveUp()

    /**
     * Set minimum and maximum permitted columns that sprites can move on the grid.
     * @param {number} min - Left-most permitted column.
     * @param {number} max - Right-most permitted column.
     */
    //% blockId="grid_setColRange"
    //% block="set allowed columns to|minimum of %min|and maximum of %max"
    //% min.defl=0 max.defl=9
    //% group="Grid" weight=49
    export function setColRange(min: number = 0, max: number = 4): void {
        grid.setColRange(min, max)
    }   // setColRange()

    /**
     * Set minimum and maximum permitted rows that sprites can move on the grid.
     * @param {number} min - Top-most permitted column.
     * @param {number} max - Bottom-most permitted column.
     */
    //% blockId="grid_setRowRange"
    //% block="set allowed rows to|minimum of %min|and maximum of %max"
    //% min.defl=0 max.defl=9
    //% group="Grid" weight=48
    export function setRowRange(min: number = 0, max: number = 3): void {
        grid.setRowRange(min, max)
    }   // setRowRange()

    /**
     * Set the size of the grid.
     * @param {number} rows - Number of rows in the grid.
     * @param {number} columns - Number of columns in the grid.
     */
    //% blockId="grid_ControlGrid_setSize"
    //% block="set grid size|to %rows rows|and %columns columns"
    //% sprite.defl="mySprite" sprite.shadow="variables_get"
    //% rows.defl=5 columns.defl=4
    //% group="Grid" weight=99
    export function setSize(rows: number = 5, columns: number = 4): void {
        grid.setSize(rows, columns)
    }   // setSize()

    /**
     * Place a sprite on the grid.
     * @param {Sprite} sprite - Sprite to place.
     * @param {number} row - Row in which to place sprite.
     * @param {number} column - Column in which to place sprite.
     */
    //% blockId="grid_setSpriteLocation"
    //% block="place sprite %sprite|at row %row|and column %column"
    //% sprite.defl="mySprite" sprite.shadow="variables_get" row.defl=1 column.defl=1
    //% group="Sprites" weight=99
    export function setSpriteLocation(sprite: Sprite, row: number, column: number): void {
        grid.setSprite(sprite, row, column)
    }   // setSpriteLocation()

    /**
     * @param {number} value - Speed at which sprites will move to a new coordinate.
     */
    //% blockId="grid_setSpriteVelocity"
    //% block="set sprite transition speed to %value"
    //% value.defl=100
    //% group="Sprites" weight=0
    export function setSpriteVelocity(value: number): void {
        grid.velocity = value
    }   // setSpriteVelocity()
}   // namespace grid