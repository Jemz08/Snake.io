export interface SpatialEntity {
  id: string | number;
  x: number;
  y: number;
  radius?: number;
  [key: string]: any;
}

export class SpatialHashGrid<T extends SpatialEntity> {
  private cellSize: number;
  private invCellSize: number;
  private grid: Map<number, T[]> = new Map();

  constructor(cellSize: number = 250) {
    this.cellSize = cellSize;
    this.invCellSize = 1 / cellSize;
  }

  public clear() {
    this.grid.clear();
  }

  private hash(cx: number, cy: number): number {
    // 32-bit integer spatial hash key
    return ((cx & 0xffff) << 16) | (cy & 0xffff);
  }

  public insert(entity: T) {
    const cx = Math.floor(entity.x * this.invCellSize);
    const cy = Math.floor(entity.y * this.invCellSize);
    const key = this.hash(cx, cy);

    let cell = this.grid.get(key);
    if (!cell) {
      cell = [];
      this.grid.set(key, cell);
    }
    cell.push(entity);
  }

  public insertWithRadius(entity: T, radius: number) {
    const minCx = Math.floor((entity.x - radius) * this.invCellSize);
    const maxCx = Math.floor((entity.x + radius) * this.invCellSize);
    const minCy = Math.floor((entity.y - radius) * this.invCellSize);
    const maxCy = Math.floor((entity.y + radius) * this.invCellSize);

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const key = this.hash(cx, cy);
        let cell = this.grid.get(key);
        if (!cell) {
          cell = [];
          this.grid.set(key, cell);
        }
        cell.push(entity);
      }
    }
  }

  public query(x: number, y: number, radius: number): T[] {
    const minCx = Math.floor((x - radius) * this.invCellSize);
    const maxCx = Math.floor((x + radius) * this.invCellSize);
    const minCy = Math.floor((y - radius) * this.invCellSize);
    const maxCy = Math.floor((y + radius) * this.invCellSize);

    const results: T[] = [];
    const seen = new Set<string | number>();

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const key = this.hash(cx, cy);
        const cell = this.grid.get(key);
        if (cell) {
          for (let i = 0; i < cell.length; i++) {
            const item = cell[i];
            if (!seen.has(item.id)) {
              seen.add(item.id);
              results.push(item);
            }
          }
        }
      }
    }
    return results;
  }
}
