// smiles-drawer ships no type definitions and exposes a single default export
// (the SmilesDrawer namespace object). Declare the minimal surface we use.
declare module 'smiles-drawer' {
  export interface SmiDrawerInstance {
    draw(
      smiles: string,
      target: SVGElement | HTMLElement | string | null,
      theme?: string,
      successCallback?: ((svg?: SVGElement) => void) | null,
      errorCallback?: ((err: unknown) => void) | null,
      weights?: number[] | null,
    ): void;
  }

  export interface SmiDrawerConstructor {
    new (
      moleculeOptions?: Record<string, unknown>,
      reactionOptions?: Record<string, unknown>,
    ): SmiDrawerInstance;
  }

  export interface SmilesDrawerNamespace {
    SmiDrawer: SmiDrawerConstructor;
    [key: string]: unknown;
  }

  const SmilesDrawer: SmilesDrawerNamespace;
  export default SmilesDrawer;
}
