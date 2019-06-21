# moveUp function

Moves a sprite one row up on the grid.

```typescript
grid.moveUp(sprite: Sprite, jump: boolean = true): void
```

## Parameters
- `sprite: Sprite` Sprite to move.
- `jump: boolean` Whether to "teleport" or "slide" the sprite. `true` = teleport, `false` = slide.