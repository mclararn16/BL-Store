// O pacote `parse` não publica tipos no build do navegador.
// Usamos o bundle UMD e tipamos o necessário em `types.ts`.
declare module "parse/dist/parse.min.js" {
  const Parse: any;
  export default Parse;
}
