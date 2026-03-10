pipeline {
    agent any

    environment {
        // Add Node 24 LTS, Homebrew, and rbenv to PATH so Jenkins can find node, npm, ruby, bundle
        PATH = "/opt/homebrew/opt/node@24/bin:/opt/homebrew/bin:/Users/bellkimkeithonggon/.rbenv/shims:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

        LANG = "en_US.UTF-8"
        LC_ALL = "en_US.UTF-8"
        FASTLANE_SKIP_UPDATE_CHECK = "1"

        // Apple Developer credentials (add these in Jenkins → Manage Jenkins → Credentials → Global)
        ASC_KEY_ID          = credentials('asc-key-id')
        ASC_ISSUER_ID       = credentials('asc-issuer-id')
        ASC_KEY_FILEPATH    = credentials('asc-api-key-file')
        KEYCHAIN_PASSWORD   = credentials('keychain-password')
        APPLE_TEAM_ID       = credentials('apple-team-id')

        // Fastlane Match — encrypts/decrypts certs stored in private git repo
        MATCH_PASSWORD                = credentials('match-password')
        MATCH_GIT_BASIC_AUTHORIZATION = credentials('match-git-token')
        MATCH_GIT_URL                 = credentials('match-git-url')

        // Apple ID email (required by fastlane/Appfile)
        APPLE_ID                      = credentials('apple-id')
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    parameters {
        string(
            name: 'BRANCH',
            defaultValue: 'main',
            description: 'Git branch to build (e.g., main, develop, feature/my-feature)'
        )
        choice(
            name: 'BUILD_TYPE',
            choices: ['development', 'production'],
            description: 'development = simulator build (no Apple account needed), production = signed build for distribution (requires Apple Developer account)'
        )
        choice(
            name: 'DISTRIBUTION',
            choices: ['none', 'testflight', 'appstore'],
            description: 'Distribution target (only applies to production builds)'
        )
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh "git checkout ${params.BRANCH}"
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

        stage('Unlock Keychain') {
            when { expression { params.BUILD_TYPE == 'production' } }
            steps {
                sh 'security unlock-keychain -p "${KEYCHAIN_PASSWORD}" ~/Library/Keychains/login.keychain-db'
            }
        }

        stage('Build iOS') {
            steps {
                script {
                    if (params.BUILD_TYPE == 'development') {
                        echo "Building DEVELOPMENT version (simulator, no signing required)"
                        sh "bundle exec fastlane ios build_sim"
                    } else {
                        echo "Building PRODUCTION version (requires Apple Developer account)"
                        if (params.DISTRIBUTION == 'testflight') {
                            sh "bundle exec fastlane ios beta"
                        } else if (params.DISTRIBUTION == 'appstore') {
                            sh "bundle exec fastlane ios release"
                        } else {
                            sh "bundle exec fastlane ios build"
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline completed successfully!"
            sh 'echo "=== Build Output ===" && find build -not -path "*/derived_data/*" | sort'
            archiveArtifacts(
                artifacts: 'build/**/*',
                allowEmptyArchive: true
            )
            script {
                def buildLabel = params.BUILD_TYPE == 'development' ? 'dev' : "prod-${params.DISTRIBUTION}"
                def zipName = "PickleballScorer-${buildLabel}-${env.BUILD_NUMBER}.zip"
                def artifactUrl = "${env.BUILD_URL}artifact/build/${zipName}"
                echo "Download build artifact: ${artifactUrl}"
                echo "Branch: ${params.BRANCH}, Build Type: ${params.BUILD_TYPE}, Distribution: ${params.DISTRIBUTION}"
            }
        }
        failure {
            echo "Pipeline FAILED. Check the logs above."
            sh 'mkdir -p build && cp ~/Library/Logs/gym/PickleballScorer-PickleballScorer.log build/gym-build.log 2>/dev/null || true'
            archiveArtifacts(
                artifacts: 'build/gym-build.log',
                allowEmptyArchive: true
            )
        }
    }
}
