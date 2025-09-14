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
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Install deps') {
      steps {
        script {
          if (isUnix()) {
            sh '''
              node -v
              npm -v
              npm install
              npx playwright install
              npx playwright install-deps || true
            '''
          } else {
            bat '''
              node -v
              npm -v
              call npm install
              npx playwright install
            '''
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
