NODE_ENV=test ts-mocha -p test_tsconfig.json --require src/test/helpers.tsx --exit src/test/local/*.test.ts*
