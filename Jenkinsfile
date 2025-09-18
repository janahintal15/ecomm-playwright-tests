pipeline {
  agent any

  tools { nodejs 'node20' }

  options {
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '20'))
    disableConcurrentBuilds()
  }

  parameters {
    choice(name: 'TEST_ENV', choices: ['S2', 'PROD'], description: 'Which Playwright project to run')
    string(name: 'TAGS', defaultValue: '', description: 'Optional @tag filter (e.g., smoke)')
  }

  environment {
    JUNIT_FILE = 'reports/junit.xml'
    HTML_DIR   = 'playwright-report'
    PLAYWRIGHT_BROWSERS_PATH = 'D:\\Jenkins\\playwright-browsers'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout([
          $class: 'GitSCM',
          branches: [[name: '*/main']],
          doGenerateSubmoduleConfigurations: false,
          extensions: [[$class: 'WipeWorkspace']],
          submoduleCfg: [],
          userRemoteConfigs: [[
            url: 'https://github.com/janahintal15/ecomm-playwright-tests.git'
          ]],
          changelog: false
        ])
      }
    }

    stage('Install Dependencies') {
      steps {
        bat 'npm ci'
      }
    }

    stage('Install deps') {
      steps {
        script {
          if (isUnix()) {
            sh '''
              node -v
              npm -v
              npm ci
              npx playwright install
            '''
          } else {
            bat '''
              node -v
              npm -v
              if not exist D:\\Jenkins\\playwright-browsers mkdir D:\\Jenkins\\playwright-browsers
              set PLAYWRIGHT_BROWSERS_PATH=D:\\Jenkins\\playwright-browsers
              call npm ci
              npx playwright install --force chromium
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

          // ✅ Capture exit code so failures don't stop pipeline
          int exitCode
          if (isUnix()) {
            exitCode = sh(returnStatus: true, script: "npx playwright test --project=${params.TEST_ENV} ${tagArg}")
          } else {
            exitCode = bat(returnStatus: true, script: "npx playwright test --project=${params.TEST_ENV} ${tagArg}")
          }
          echo "Playwright exited with code ${exitCode} — continuing pipeline regardless of failures."
          // Do not fail build here, let junit mark build UNSTABLE based on test results
        }
      }
    }
  }

  post {
    always {
      junit allowEmptyResults: true, testResults: "${JUNIT_FILE}"

      publishHTML(target: [
        reportDir: "${HTML_DIR}",
        reportFiles: 'index.html',
        allowMissing: true,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportName: 'Playwright HTML Report'
      ])

      archiveArtifacts artifacts: "${HTML_DIR}/**/*, ${JUNIT_FILE}", allowEmptyArchive: true
    }
  }
}
