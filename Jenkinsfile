pipeline {
  agent any
  tools { nodejs 'node20' }

  triggers { cron('TZ=Australia/Sydney\n0 6 * * *') }

  environment {
    HTML_DIR_S2   = 'playwright-report-S2'
    HTML_DIR_PROD = 'playwright-report-PROD'
    JUNIT_S2      = 'reports/junit-S2.xml'
    JUNIT_PROD    = 'reports/junit-PROD.xml'
    PLAYWRIGHT_BROWSERS_PATH = 'D:\\Jenkins\\playwright-browsers'
  }

  stages {
    stage('Checkout'){ steps { /* ... your existing checkout ... */ } }
    stage('Install Dependencies'){ steps { bat 'npm ci' } }
    stage('Install Playwright Browsers'){ steps { /* ... your existing install ... */ } }

    stage('Run Playwright - S2') {
      steps {
        writeFile file: '.env', text: """S2_BASE_URL=https://s2.cengagelearning.com.au
PROD_BASE_URL=https://www.cengage.com.au
ENV=S2
"""
        // run tests and keep going even if they fail
        bat(returnStatus: true, script: 'npx playwright test --project=S2')
      }
    }

    stage('Run Playwright - PROD') {
      steps {
        writeFile file: '.env', text: """S2_BASE_URL=https://s2.cengagelearning.com.au
PROD_BASE_URL=https://www.cengage.com.au
ENV=PROD
"""
        bat(returnStatus: true, script: 'npx playwright test --project=PROD')
      }
      // ✅ Only PROD sends email
      post {
        success {
          emailext(
            to: 'janah.intal@ibc.com.au, Will.Castley@cengage.com',
            subject: "ECOMM Playwright – SUCCESS (PROD) #${env.BUILD_NUMBER}",
            mimeType: 'text/html',
            body: """
              <p>PROD run succeeded.</p>
              <p><a href="${env.BUILD_URL}">Build ${env.BUILD_NUMBER}</a></p>
              <p>Open <b>Playwright HTML Report (PROD)</b> on the build page.</p>
            """
          )
        }
        unstable {
          emailext(
            to: 'janah.intal@ibc.com.au, Will.Castley@cengage.com',
            subject: "ECOMM Playwright – UNSTABLE (PROD) #${env.BUILD_NUMBER}",
            mimeType: 'text/html',
            attachmentsPattern: "${env.JUNIT_PROD}",
            body: """
              <p>PROD run is UNSTABLE (some tests failed).</p>
              <p><a href="${env.BUILD_URL}">Build ${env.BUILD_NUMBER}</a></p>
              <p>JUnit attached. See <b>Playwright HTML Report (PROD)</b> for details.</p>
            """
          )
        }
        failure {
          emailext(
            to: 'janah.intal@ibc.com.au, Will.Castley@cengage.com',
            subject: "ECOMM Playwright – FAILED (PROD) #${env.BUILD_NUMBER}",
            mimeType: 'text/html',
            attachmentsPattern: "${env.JUNIT_PROD}",
            body: """
              <p>PROD run failed.</p>
              <p><a href="${env.BUILD_URL}">Build ${env.BUILD_NUMBER}</a></p>
              <p>JUnit attached. See <b>Playwright HTML Report (PROD)</b> for details.</p>
            """
          )
        }
      }
    }
  }

  post {
    always {
      // Publish both JUnit reports (S2 + PROD)
      junit allowEmptyResults: true, testResults: "${JUNIT_S2}, ${JUNIT_PROD}"

      // Publish both HTML reports (assumes your Playwright config writes per-env folders)
      publishHTML(target: [
        reportDir: "${HTML_DIR_S2}",
        reportFiles: 'index.html', allowMissing: true,
        alwaysLinkToLastBuild: true, keepAll: true,
        reportName: 'Playwright HTML Report (S2)'
      ])
      publishHTML(target: [
        reportDir: "${HTML_DIR_PROD}",
        reportFiles: 'index.html', allowMissing: true,
        alwaysLinkToLastBuild: true, keepAll: true,
        reportName: 'Playwright HTML Report (PROD)'
      ])

      // Archive everything
      archiveArtifacts artifacts: "test-results/**/*, ${HTML_DIR_S2}/**/*, ${HTML_DIR_PROD}/**/*, ${JUNIT_S2}, ${JUNIT_PROD}",
                        allowEmptyArchive: true
    }
  }
}
