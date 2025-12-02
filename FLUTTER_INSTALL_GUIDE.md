# How to Install Flutter on Windows

Since the automatic installation failed, please follow these manual steps to install Flutter.

## Step 1: Download Flutter SDK
1.  Go to the official Flutter website: [https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_3.24.3-stable.zip](https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_3.24.3-stable.zip)
2.  Download the zip file.

## Step 2: Extract the SDK
1.  Extract the zip file to a location on your drive, for example: `C:\src\flutter`.
    *   **Warning**: Do not install it in `C:\Program Files` due to permission issues.

## Step 3: Update Path Variable
1.  In the Windows Search Bar, type **"env"** and select **"Edit the system environment variables"**.
2.  Click the **"Environment Variables..."** button.
3.  Under **"User variables"**, find the variable named **"Path"** and double-click it.
4.  Click **"New"** and add the full path to the `flutter\bin` folder.
    *   Example: `C:\src\flutter\bin`
5.  Click **OK** on all windows.

## Step 4: Verify Installation
1.  Close and reopen your Terminal (PowerShell or Command Prompt).
2.  Run the following command:
    ```bash
    flutter doctor
    ```
3.  If successful, you will see a summary of the Flutter environment.

## Step 5: Run the App
Once installed, navigate back to the project folder and run:
```bash
cd apps/mobile_app
flutter create .
flutter run -d chrome
```
