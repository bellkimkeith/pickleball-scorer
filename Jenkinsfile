pipeline {
    agent any

    environment {
        // Add Node 24 LTS, Homebrew, and rbenv to PATH so Jenkins can find node, npm, ruby, bundle
        PATH = "/opt/homebrew/opt/node@24/bin:/opt/homebrew/bin:/Users/bellkimkeithonggon/.rbenv/shims:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

        LANG = "en_US.UTF-8"
        LC_ALL = "en_US.UTF-8"
        FASTLANE_SKIP_UPDATE_CHECK = "1"

        // Uncomment after Apple Developer account setup:
        // ASC_KEY_ID = credentials('asc-key-id')
        // ASC_ISSUER_ID = credentials('asc-issuer-id')
        // ASC_KEY_FILEPATH = credentials('asc-api-key-file')
        // KEYCHAIN_PASSWORD = credentials('keychain-password')
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    parameters {
        choice(
            name: 'BUILD_TARGET',
            choices: ['build_sim', 'beta', 'release'],
            description: 'build_sim = no signing, beta = TestFlight, release = App Store'
        )
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install JS Dependencies') {
            steps {
                sh 'npm ci --legacy-peer-deps'
            }
        }

        stage('Type Check & Lint') {
            parallel {
                stage('TypeScript') {
                    steps {
                        sh 'npx tsc --noEmit'
                    }
                }
                stage('ESLint') {
                    steps {
                        sh 'npm run lint'
                    }
                }
            }
        }

        stage('Expo Prebuild') {
            steps {
                sh 'npx expo prebuild --clean'
            }
        }

        stage('Install Fastlane') {
            steps {
                sh 'bundle config set --local path vendor/bundle && bundle install'
            }
        }

        stage('Build iOS') {
            steps {
                sh "bundle exec fastlane ios ${params.BUILD_TARGET}"
            }
        }
    }

    post {
        success {
            echo "Pipeline completed successfully!"
            archiveArtifacts(
                artifacts: 'build/**/*',
                allowEmptyArchive: true
            )
        }
        failure {
            echo "Pipeline FAILED. Check the logs above."
        }
    }
}
