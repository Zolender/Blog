import { defineConfig } from 'vitest/config'
import { config } from 'dotenv'

config({ path: '.env.test' })

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./src/tests/setup.ts'],
        testTimeout: 15000,
        // All test files share one Postgres database, and afterEach TRUNCATEs
        // every table. Running files in parallel would let one file's cleanup
        // wipe another file's data mid-test, so we run them serially.
        fileParallelism: false,
    }
})
