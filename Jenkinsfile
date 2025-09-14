stages {
    stage('Checkout') {
        steps {
            // Explicitly checkout with changelog generation disabled
            checkout([
                $class: 'GitSCM',
                branches: [[name: '*/main']],
                doGenerateSubmoduleConfigurations: false,
                extensions: [[$class: 'WipeWorkspace']], // Good practice to start with a clean workspace
                submoduleCfg: [],
                userRemoteConfigs: [[
                    url: 'https://github.com/janahintal15/ecomm-playwright-tests.git'
                ]],
                changelog: false // The key change
            ])
        }
    }

    stage('Install deps') {
        steps {
            script {
                if (isUnix()) {
                    sh '''
                      node -v
                      npm -v
                      npm install --legacy-peer-deps
                      npx playwright install
                    '''
                } else {
                    bat '''
                      node -v
                      npm -v
                      call npm install --legacy-peer-deps
                      npx playwright install
                    '''
                }
            }
        }
    }

    stage('Verify install') {
        steps {
            script {
                if (isUnix()) {
                    sh 'ls -la node_modules/@playwright/test || echo "Playwright not found"'
                } else {
                    bat 'dir node_modules\\@playwright\\test || echo Playwright not found'
                }
            }
        }
    }

    stage('Create .env for selected env') {
        steps {
            script {
                if (params.TEST_ENV == 'S2') {
                    withCredentials([usernamePassword(credentialsId: 'ecom-s2-creds', usernameVariable: 'U', passwordVariable: 'P')]) {
                        writeFile file: '.env', text: """S2_BASE_URL=https://s2.cengagelearning.com.au
PROD_BASE_URL=https://www.cengage.com.au
S2_EMAIL=${U}
S2_PASSWORD=${P}
ENV=S2
"""
                    }
                } else {
                    withCredentials([usernamePassword(credentialsId: 'ecom-prod-creds', usernameVariable: 'U', passwordVariable: 'P')]) {
                        writeFile file: '.env', text: """S2_BASE_URL=https://s2.cengagelearning.com.au
PROD_BASE_URL=https://www.cengage.com.au
PROD_EMAIL=${U}
PROD_PASSWORD=${P}
ENV=PROD
"""
                    }
                }
            }
        }
    }

    stage('Run Playwright') {
        steps {
            script {
                def tagArg = params.TAGS?.trim() ? "--grep @${params.TAGS.trim()}" : ""
                if (isUnix()) {
                    sh "npx playwright test --project=${params.TEST_ENV} ${tagArg}"
                } else {
                    bat "npx playwright test --project=${params.TEST_ENV} ${tagArg}"
                }
            }
        }
    }
}