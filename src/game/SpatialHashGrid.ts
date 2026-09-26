/**
 * High-Performance Uniform Spatial Hash Grid for 2D Entity Partitioning
 * Reduces collision and proximity queries from O(N * M) to O(1) near-constant time.
 */

export class SpatialHashGrid<T extends { id: number | string; x: number; y: number; radius?: number }> {
  private cellSize: number;
  private cols: number;
  private rows: number;
  private worldSize: number;
  private cells: Map<number, T[]>;
  private itemCellMap: Map<number | string, number>;

  constructor(worldSize = 6000, cellSize = 200) {
    this.worldSize = worldSize;
    this.cellSize = cellSize;
    this.cols = Math.ceil(worldSize / cellSize);
    this.rows = Math.ceil(worldSize / cellSize);
    this.cells = new Map();
    this.itemCellMap = new Map();
  }

  private getCellKey(col: number, row: number): number {
    return col + row * this.cols;
  }

  private getCoords(x: number, y: number): { col: number; row: number } {
    const col = Math.max(0, Math.min(this.cols - 1, Math.floor(x / this.cellSize)));
    const row = Math.max(0, Math.min(this.rows - 1, Math.floor(y / this.cellSize)));
    return { col, row };
  }

  public clear(): void {
    this.cells.clear();
    this.itemCellMap.clear();
  }

  public insert(item: T): void {
    const { col, row } = this.getCoords(item.x, item.y);
    const key = this.getCellKey(col, row);

    let cell = this.cells.get(key);
    if (!cell) {
      cell = [];
      this.cells.set(key, cell);
    }
    cell.push(item);
    this.itemCellMap.set(item.id, key);
  }

  public remove(item: T): boolean {
    const key = this.itemCellMap.get(item.id);
    if (key === undefined) return false;

    const cell = this.cells.get(key);
    if (cell) {
      const idx = cell.indexOf(item);
      if (idx !== -1) {
        // Fast swap-with-last removal: O(1) instead of O(N) array splice
        const last = cell.pop();
        if (idx < cell.length && last !== undefined) {
          cell[idx] = last;
        }
      }
      if (cell.length === 0) {
        this.cells.delete(key);
      }
    }
    this.itemCellMap.delete(item.id);
    return true;
  }

  public update(item: T): void {
    this.remove(item);
    this.insert(item);
  }

  /**
   * Bulk populate the grid in a single lightning-fast pass
   */
  public rebuild(items: T[]): void {
    this.clear();
    for (let i = 0; i < items.length; i++) {
      this.insert(items[i]);
    }
  }

  /**
   * Fast query for all entities within a circular radius
   */
  public queryRadius(x: number, y: number, radius: number): T[] {
    const minCol = Math.max(0, Math.floor((x - radius) / this.cellSize));
    const maxCol = Math.min(this.cols - 1, Math.floor((x + radius) / this.cellSize));
    const minRow = Math.max(0, Math.floor((y - radius) / this.cellSize));
    const maxRow = Math.min(this.rows - 1, Math.floor((y + radius) / this.cellSize));

    const results: T[] = [];
    const radSq = radius * radius;

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const key = this.getCellKey(c, r);
        const cell = this.cells.get(key);
        if (cell) {
          for (let i = 0; i < cell.length; i++) {
            const item = cell[i];
            const dx = item.x - x;
            const dy = item.y - y;
            const itemRad = item.radius || 0;
            const maxDist = radius + itemRad;
            if (dx * dx + dy * dy <= maxDist * maxDist) {
              results.push(item);
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Fast query for all entities within rectangular bounding box (camera viewport culling)
   */
  public queryBounds(minX: number, minY: number, maxX: number, maxY: number): T[] {
    const minCol = Math.max(0, Math.floor(minX / this.cellSize));
    const maxCol = Math.min(this.cols - 1, Math.floor(maxX / this.cellSize));
    const minRow = Math.max(0, Math.floor(minY / this.cellSize));
    const maxRow = Math.min(this.rows - 1, Math.floor(maxY / this.cellSize));

    const results: T[] = [];
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const key = this.getCellKey(c, r);
        const cell = this.cells.get(key);
        if (cell) {
          for (let i = 0; i < cell.length; i++) {
            results.push(cell[i]);
          }
        }
      }
    }

    return results;
  }
}
