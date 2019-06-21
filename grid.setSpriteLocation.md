# setSpriteLocation function

Place a sprite on the grid. A location of `0` (zero) is the first row or column that is visible on the screen. A location of `-1` is at the top or left edge of the screen.

```typescript
grid.setSpriteLocation(sprite: Sprite,
  row: number, column: number): void
```

## Parameters

- `sprite: Sprite` Sprite to place on the grid.
- `row: number` Row in which to place the sprite.
- `column: number` Column in which to place the sprite.