pipeline {
  agent any

  tools { nodejs 'node20' }

  // Run every day 06:00 Sydney time
  triggers {
    cron('TZ=Australia/Sydney\n0 6 * * *')
  }

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
    // Cache Playwright browsers on the Windows controller/agent
    PLAYWRIGHT_BROWSERS_PATH = 'D:\\Jenkins\\playwright-browsers'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout([
          $class: 'GitSCM',
          branches: [[name: '*/main']],
          extensions: [[$class: 'WipeWorkspace']],
          userRemoteConfigs: [[url: 'https://github.com/janahintal15/ecomm-playwright-tests.git']],
          changelog: false
        ])
      }
    }

    stage('Install Dependencies') {
      steps {
        bat 'npm ci'
      }
    }

    stage('Install Playwright Browsers') {
      steps {
        script {
          if (isUnix()) {
            sh '''
              node -v
              npm -v
              npx playwright install --with-deps
            '''
          } else {
            bat """
              node -v
              npm -v
              if not exist "${env.PLAYWRIGHT_BROWSERS_PATH}" mkdir "${env.PLAYWRIGHT_BROWSERS_PATH}"
              set PLAYWRIGHT_BROWSERS_PATH=${env.PLAYWRIGHT_BROWSERS_PATH}
              npx playwright install --force chromium
            """
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

          // Capture exit code so failures don't stop pipeline
          int exitCode
          if (isUnix()) {
            exitCode = sh(returnStatus: true, script: "npx playwright test --project=${params.TEST_ENV} ${tagArg}")
          } else {
            exitCode = bat(returnStatus: true, script: "npx playwright test --project=${params.TEST_ENV} ${tagArg}")
          }
          echo "Playwright exited with code ${exitCode} — continuing to publish reports."
        }
      }
    }
  }

  post {
    always {
      // Publish JUnit (will mark build UNSTABLE if tests failed)
      junit allowEmptyResults: true, testResults: "${JUNIT_FILE}"

      // Publish Playwright HTML report as a side panel link
      publishHTML(target: [
        reportDir: "${HTML_DIR}",
        reportFiles: 'index.html',
        allowMissing: true,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportName: 'Playwright HTML Report'
      ])

      // Keep artifacts (HTML, JUnit, raw test-results incl. traces/screens/videos)
      archiveArtifacts artifacts: "test-results/**/*, ${HTML_DIR}/**/*, ${JUNIT_FILE}", allowEmptyArchive: true
    }

    success {
      emailext(
        to: 'janah.intal@ibc.com.au', 'Will.Castley@cengage.com',
        subject: "ECOMM Playwright  SUCCESS #${env.BUILD_NUMBER}",
        mimeType: 'text/html',
        body: """
          <p><b>${env.JOB_NAME} #${env.BUILD_NUMBER}</b> completed successfully.</p>
          <p>Build: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
          <p>Open <b>Playwright HTML Report</b> on the build page for details.</p>
        """
      )
    }

    unstable {
      emailext(
        to: 'janah.intal@ibc.com.au', 'Will.Castley@cengage.com',
        subject: "ECOMM Playwright  UNSTABLE #${env.BUILD_NUMBER}",
        mimeType: 'text/html',
        attachmentsPattern: "${JUNIT_FILE}",
        body: """
          <p><b>${env.JOB_NAME} #${env.BUILD_NUMBER}</b> is UNSTABLE (some tests failed).</p>
          <p>Build: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
          <ul>
            <li>JUnit XML attached</li>
            <li>Click <b>Playwright HTML Report</b> on the build page for screenshots/videos/traces</li>
          </ul>
        """
      )
    }

    failure {
      emailext(
        to: 'janah.intal@ibc.com.au', 'Will.Castley@cengage.com',
        subject: "ECOMM Playwright  FAILED #${env.BUILD_NUMBER}",
        mimeType: 'text/html',
        attachmentsPattern: "${JUNIT_FILE}",
        body: """
          <p><b>${env.JOB_NAME} #${env.BUILD_NUMBER}</b> FAILED.</p>
          <p>Build: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
          <ul>
            <li>JUnit XML attached</li>
            <li>Open <b>Playwright HTML Report</b> on the build page for details</li>
          </ul>
        """
      )
    }
  }
}
