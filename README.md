# crate-static

## Scripts

Run

```shell
bun run index.ts
```

Build (Windows)

```shell
bun build ./index.ts --compile --outfile crate-static.exe
```

Build (Windows --> Linux)

```shell
bun build --compile --target=bun-linux-x64 ./index.ts --outfile crate-static

# To explicitly only support CPUs from 2013 and later, use the modern version (haswell)
# modern is faster, but baseline is more compatible.
bun build --compile --target=bun-linux-x64-modern ./index.ts --outfile crate-static
```