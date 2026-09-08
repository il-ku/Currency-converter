# Инструкция по сборке .APK

Так как приложение построено на веб-технологиях (React/Vite), для того чтобы получить настоящий `.apk` файл для установки, его нужно "обернуть" с помощью инструмента Capacitor от Ionic.

Следуйте этим шагам на вашем компьютере:

1. **Скачайте исходный код** 
   В Google AI Studio нажмите `Settings` (шестеренка в правом верхнем углу) -> `Export` -> `Download ZIP`.
   Распакуйте архив на вашем компьютере.

2. **Установите зависимости**
   Откройте терминал в папке проекта и выполните:
   ```bash
   npm install
   ```

3. **Соберите веб-проект**
   ```bash
   npm run build
   ```

4. **Установите Capacitor**
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```

5. **Инициализируйте Capacitor**
   ```bash
   npx cap init "Currency Radar" "com.currencyradar.app" --web-dir dist
   ```

6. **Добавьте платформу Android**
   ```bash
   npx cap add android
   ```

7. **Соберите APK**
   Для сборки вам понадобится установленный Android Studio.
   ```bash
   npx cap open android
   ```
   В открывшемся окне Android Studio дождитесь синхронизации Gradle, затем в верхнем меню выберите **Build -> Build Bundle(s) / APK(s) -> Build APK(s)**.

После этого в папке `android/app/build/outputs/apk/debug/` появится ваш готовый файл `app-debug.apk`, который можно отправить на телефон и установить!
