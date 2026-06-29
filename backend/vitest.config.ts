import { defineConfig } from 'vitest/config'
import { config } from 'dotenv'

config({ path: '.env.test' })

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./src/tests/setup.ts'],
        testTimeout: 15000,
    }
})
