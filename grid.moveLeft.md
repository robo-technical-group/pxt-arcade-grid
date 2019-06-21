# moveLeft function

Moves a sprite one column to the left on the grid.

```typescript
grid.moveLeft(sprite: Sprite, jump: boolean = true): void
```

## Parameters
- `sprite: Sprite` Sprite to move.
- `jump: boolean` Whether to "teleport" or "slide" the sprite. `true` = teleport, `false` = slide.