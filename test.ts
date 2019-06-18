let bg: Image = image.create(screen.width, screen.height)
let columns: number = 4
let rows: number = 3
let taco: Sprite = sprites.create(sprites.food.smallTaco, 0)

scene.setBackgroundImage(bg)
grid.allowWrap(true)
grid.setSpriteVelocity(150)
setGridSize()
drawGrid()

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    columns += 1
    setGridSize()
    drawGrid()
})
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    rows += 1
    setGridSize()
    drawGrid()
})
controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    grid.moveDown(taco, false)
})
controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    grid.moveLeft(taco)
})
controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    grid.moveRight(taco, false)
})
controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    grid.moveUp(taco)
})

function drawGrid() {
    bg.fill(0)
    grid.drawGrid(bg, 7)
}   // drawGrid()

function setGridSize() {
    grid.setSize(rows, columns)
    grid.setSpriteLocation(taco, 0, 0)
}   // setGridSize()