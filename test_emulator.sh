NODE_ENV=test ts-mocha -p test_tsconfig.json --require src/test/helpers.tsx --require source-map-support/register --recursive --exit src/test/emulator/*.test.ts*
