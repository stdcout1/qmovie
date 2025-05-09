{ pkgs }:

let
  pname = "qmovie"; # <same as package.json name>
  version = "0.1.0";
  buildInputs = with pkgs; [
    nodejs
    nodePackages_latest.pnpm
    pkgs.prisma-engines pkgs.nodePackages.prisma
  ];
  nativeBuildInputs = buildInputs;
  npmDepsHash = "sha256-hBJ4NN942R0tQ50byWRMY2k06mei8SFWgBtGtElEIGc="; # <prefetch-npm-deps package-lock.json>
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
    touch $exe
    chmod +x $exe
    echo "
        #!/usr/bin/env bash
        cd $lib
        ${pkgs.nodePackages_latest.pnpm}/bin/pnpm run start " > $exe
  '';
}
