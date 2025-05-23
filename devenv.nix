{ pkgs, lib, config, inputs, ... }:

{
  # https://devenv.sh/basics/
  env.GREET = "devenv";
  env.DATABASE_URL = "postgresql://nasir@localhost:5432/db";
  env.PRISMA_QUERY_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/query-engine";
  env.PRISMA_QUERY_ENGINE_LIBRARY = "${pkgs.prisma-engines}/lib/libquery_engine.node";
  env.PRISMA_SCHEMA_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/schema-engine";

  dotenv.enable = true;

  # https://devenv.sh/packages/
  packages = [ pkgs.git pkgs.pgweb pkgs.prisma-engines pkgs.openssl pkgs.nodePackages.prisma pkgs.nodejs pkgs.jackett ];

  # https://devenv.sh/scripts/
  scripts.hello.exec = "echo hello from $GREET";

  enterShell = ''
    cp "${
      pkgs.google-fonts.override { fonts = [ "Inter" ]; }
    }/share/fonts/truetype/Inter[opsz,wght].ttf" app/Inter.ttf
  '';

  # https://devenv.sh/tests/
  enterTest = ''
    echo "Running tests"
    git --version | grep "2.42.0"
  '';

  # https://devenv.sh/services/
  services.postgres = {
    enable = true;
    initialDatabases = [{ name = "db"; }];
    listen_addresses = "127.0.0.1";
    package = pkgs.postgresql_15;
  };

  # https://devenv.sh/languages/
  # languages.nix.enable = true;

  # https://devenv.sh/pre-commit-hooks/
  # pre-commit.hooks.shellcheck.enable = true;

  # https://devenv.sh/processes/
  processes.nextjs.exec = "npm run dev";
  processes.jackett.exec = "${pkgs.jackett}/bin/jackett";

  # See full reference at https://devenv.sh/reference/options/
}
