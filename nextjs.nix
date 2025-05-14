{ pkgs, cachePath ? null }:

let
  pname = "qmovie"; # <same as package.json name>
  version = "0.1.0";
  buildInputs = with pkgs; [
    nodejs
    nodePackages_latest.pnpm
    pkgs.prisma-engines
    pkgs.nodePackages.prisma
  ];
  nativeBuildInputs = buildInputs;
  npmDepsHash = "sha256-DKNi6Ro6ityq4Sn9Wwo97d0qR5jPADcmm07Zna3vWLw="; # <prefetch-npm-deps package-lock.json>
in
pkgs.buildNpmPackage {
  inherit pname version buildInputs npmDepsHash nativeBuildInputs;
  src = ./.;
  npmFlags = [ "--legacy-peer-deps" ];
  preBuild = ''
    cp "${
      pkgs.google-fonts.override { fonts = [ "Inter" ]; }
    }/share/fonts/truetype/Inter[opsz,wght].ttf" app/Inter.ttf
  '';
  postInstall = ''
    mkdir -p $out/bin
    exe="$out/bin/${pname}"
    lib="$out/lib/node_modules/${pname}"
    ls -R .next || echo "no .next"
    cp -r ./.next $lib

    ${if cachePath != null then ''
      echo "Symlinking runtime cache path..."
      ln -s ${cachePath} $lib/.next/cache
    '' else ''
      echo "No cachePath defined, skipping symlink."
    ''}

    touch $exe
    chmod +x $exe
    echo "
        #!/usr/bin/env bash
        cd $lib
        ${pkgs.nodePackages_latest.pnpm}/bin/pnpm run start " > $exe
  '';
}
