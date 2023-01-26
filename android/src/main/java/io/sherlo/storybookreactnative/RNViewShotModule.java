
package io.sherlo.storybookreactnative;

import android.app.Activity;
import android.content.Context;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Environment;
import androidx.annotation.NonNull;
import android.util.Base64;
import android.util.DisplayMetrics;
import android.util.Log;

import com.facebook.react.bridge.GuardedAsyncTask;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.UIManagerModule;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.OutputStream;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.Collections;
import java.util.Map;
import java.util.HashMap;

import io.sherlo.storybookreactnative.ViewShot.Formats;
import io.sherlo.storybookreactnative.ViewShot.Results;

public class RNViewShotModule extends ReactContextBaseJavaModule {
    private static final String RNFSDocumentDirectoryPath = "RNFSDocumentDirectoryPath";
    private static final String RNFSExternalDirectoryPath = "RNFSExternalDirectoryPath";
    private static final String RNFSExternalStorageDirectoryPath = "RNFSExternalStorageDirectoryPath";
    private static final String RNFSPicturesDirectoryPath = "RNFSPicturesDirectoryPath";
    private static final String RNFSDownloadDirectoryPath = "RNFSDownloadDirectoryPath";
    private static final String RNFSTemporaryDirectoryPath = "RNFSTemporaryDirectoryPath";
    private static final String RNFSCachesDirectoryPath = "RNFSCachesDirectoryPath";
    private static final String RNFSExternalCachesDirectoryPath = "RNFSExternalCachesDirectoryPath";
    private static final String RNFSDocumentDirectory = "RNFSDocumentDirectory";

    private static final String RNFSFileTypeRegular = "RNFSFileTypeRegular";
    private static final String RNFSFileTypeDirectory = "RNFSFileTypeDirectory";

    public static final String RNVIEW_SHOT = "RNViewShot";

    private final ReactApplicationContext reactContext;

    public RNViewShotModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return RNVIEW_SHOT;
    }

    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        new CleanTask(getReactApplicationContext()).executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);
    }

    @ReactMethod
    public void releaseCapture(String uri) {
        final String path = Uri.parse(uri).getPath();
        if (path == null) return;
        File file = new File(path);
        if (!file.exists()) return;
        File parent = file.getParentFile();
        if (parent.equals(reactContext.getExternalCacheDir()) || parent.equals(reactContext.getCacheDir())) {
            file.delete();
        }
    }

    @ReactMethod
    public void captureRef(int tag, ReadableMap options, Promise promise) {
        final ReactApplicationContext context = getReactApplicationContext();
        final DisplayMetrics dm = context.getResources().getDisplayMetrics();

        final String extension = options.getString("format");
        final int imageFormat = "jpg".equals(extension)
                ? Formats.JPEG
                : "webm".equals(extension)
                ? Formats.WEBP
                : "raw".equals(extension)
                ? Formats.RAW
                : Formats.PNG;

        final double quality = options.getDouble("quality");
        final Integer scaleWidth = options.hasKey("width") ? options.getInt("width") : null;
        final Integer scaleHeight = options.hasKey("height") ? options.getInt("height") : null;
        final String resultStreamFormat = options.getString("result");
        final String fileName = options.hasKey("fileName") ? options.getString("fileName") : null;
        final Boolean snapshotContentContainer = options.getBoolean("snapshotContentContainer");

        try {
            File outputFile = null;
            if (Results.TEMP_FILE.equals(resultStreamFormat)) {
                outputFile = createTempFile(getReactApplicationContext(), extension, fileName);
            }

            final Activity activity = getCurrentActivity();
            final UIManagerModule uiManager = this.reactContext.getNativeModule(UIManagerModule.class);

            uiManager.addUIBlock(new ViewShot(
                    tag, extension, imageFormat, quality,
                    scaleWidth, scaleHeight, outputFile, resultStreamFormat,
                    snapshotContentContainer, reactContext, activity, promise)
            );
        } catch (final Throwable ex) {
            Log.e(RNVIEW_SHOT, "Failed to snapshot view tag " + tag, ex);
            promise.reject(ViewShot.ERROR_UNABLE_TO_SNAPSHOT, "Failed to snapshot view tag " + tag);
        }
    }

    private void reject(Promise promise, String filepath, Exception ex) {
        if (ex instanceof FileNotFoundException) {
        rejectFileNotFound(promise, filepath);
        return;
        }
        if (ex instanceof IORejectionException) {
        IORejectionException ioRejectionException = (IORejectionException) ex;
        promise.reject(ioRejectionException.getCode(), ioRejectionException.getMessage());
        return;
        }

        promise.reject(null, ex.getMessage());
    }

    private void rejectFileNotFound(Promise promise, String filepath) {
        promise.reject("ENOENT", "ENOENT: no such file or directory, open '" + filepath + "'");
    }

    @ReactMethod
    public void unlink(String filepath, Promise promise) {
        try {
        File file = new File(filepath);

        if (!file.exists()) throw new Exception("File does not exist");

        DeleteRecursive(file);

        promise.resolve(null);
        } catch (Exception ex) {
        ex.printStackTrace();
        reject(promise, filepath, ex);
        }
    }

    private void DeleteRecursive(File fileOrDirectory) {
        if (fileOrDirectory.isDirectory()) {
        for (File child : fileOrDirectory.listFiles()) {
            DeleteRecursive(child);
        }
        }

        fileOrDirectory.delete();
    }

    @ReactMethod
    public void mkdir(String filepath, ReadableMap options, Promise promise) {
        try {
        File file = new File(filepath);

        file.mkdirs();

        boolean exists = file.exists();

        if (!exists) throw new Exception("Directory could not be created");

        promise.resolve(null);
        } catch (Exception ex) {
        ex.printStackTrace();
        reject(promise, filepath, ex);
        }
    }

    @ReactMethod
    public void writeFile(String filepath, String base64Content, ReadableMap options, Promise promise) {
        try {
        byte[] bytes = Base64.decode(base64Content, Base64.DEFAULT);

        OutputStream outputStream = getOutputStream(filepath, false);
        outputStream.write(bytes);
        outputStream.close();

        promise.resolve(null);
        } catch (Exception ex) {
        ex.printStackTrace();
        reject(promise, filepath, ex);
        }
    }

    @ReactMethod
    public void appendFile(String filepath, String base64Content, Promise promise) {
        try {
        byte[] bytes = Base64.decode(base64Content, Base64.DEFAULT);

        OutputStream outputStream = getOutputStream(filepath, true);
        outputStream.write(bytes);
        outputStream.close();

        promise.resolve(null);
        } catch (Exception ex) {
        ex.printStackTrace();
        reject(promise, filepath, ex);
        }
    }


    private OutputStream getOutputStream(String filepath, boolean append) throws IORejectionException {
        Uri uri = getFileUri(filepath, false);
        OutputStream stream;
        try {
        stream = reactContext.getContentResolver().openOutputStream(uri, append ? "wa" : getWriteAccessByAPILevel());
        } catch (FileNotFoundException ex) {
        throw new IORejectionException("ENOENT", "ENOENT: " + ex.getMessage() + ", open '" + filepath + "'");
        }
        if (stream == null) {
        throw new IORejectionException("ENOENT", "ENOENT: could not open an output stream for '" + filepath + "'");
        }
        return stream;
    }

    private Uri getFileUri(String filepath, boolean isDirectoryAllowed) throws IORejectionException {
        Uri uri = Uri.parse(filepath);
        if (uri.getScheme() == null) {
        // No prefix, assuming that provided path is absolute path to file
        File file = new File(filepath);
        if (!isDirectoryAllowed && file.isDirectory()) {
            throw new IORejectionException("EISDIR", "EISDIR: illegal operation on a directory, read '" + filepath + "'");
        }
        uri = Uri.parse("file://" + filepath);
        }
        return uri;
    }

    @ReactMethod
    public void readFile(String filepath, Promise promise) {
        try {
        InputStream inputStream = getInputStream(filepath);
        byte[] inputData = getInputStreamBytes(inputStream);
        String base64Content = Base64.encodeToString(inputData, Base64.NO_WRAP);

        promise.resolve(base64Content);
        } catch (Exception ex) {
        ex.printStackTrace();
        reject(promise, filepath, ex);
        }
    }

    private String getWriteAccessByAPILevel() {
        return android.os.Build.VERSION.SDK_INT <= android.os.Build.VERSION_CODES.P ? "w" : "rwt";
    }

    private InputStream getInputStream(String filepath) throws IORejectionException {
        Uri uri = getFileUri(filepath, false);
        InputStream stream;
        try {
        stream = reactContext.getContentResolver().openInputStream(uri);
        } catch (FileNotFoundException ex) {
        throw new IORejectionException("ENOENT", "ENOENT: " + ex.getMessage() + ", open '" + filepath + "'");
        }
        if (stream == null) {
        throw new IORejectionException("ENOENT", "ENOENT: could not open an input stream for '" + filepath + "'");
        }
        return stream;
    }

    private static byte[] getInputStreamBytes(InputStream inputStream) throws IOException {
        byte[] bytesResult;
        ByteArrayOutputStream byteBuffer = new ByteArrayOutputStream();
        int bufferSize = 1024;
        byte[] buffer = new byte[bufferSize];
        try {
        int len;
        while ((len = inputStream.read(buffer)) != -1) {
            byteBuffer.write(buffer, 0, len);
        }
        bytesResult = byteBuffer.toByteArray();
        } finally {
        try {
            byteBuffer.close();
        } catch (IOException ignored) {
        }
        }
        return bytesResult;
    }

    @ReactMethod
    public void captureScreen(ReadableMap options, Promise promise) {
        captureRef(-1, options, promise);
    }

    private static final String TEMP_FILE_PREFIX = "ReactNative-snapshot-image";

    /**
     * Asynchronous task that cleans up cache dirs (internal and, if available, external) of cropped
     * image files. This is run when the catalyst instance is being destroyed (i.e. app is shutting
     * down) and when the module is instantiated, to handle the case where the app crashed.
     */
    private static class CleanTask extends GuardedAsyncTask<Void, Void> implements FilenameFilter {
        private final File cacheDir;
        private final File externalCacheDir;

        private CleanTask(ReactContext context) {
            super(context);

            cacheDir = context.getCacheDir();
            externalCacheDir = context.getExternalCacheDir();
        }

        @Override
        protected void doInBackgroundGuarded(Void... params) {
            if (null != cacheDir) {
                cleanDirectory(cacheDir);
            }

            if (externalCacheDir != null) {
                cleanDirectory(externalCacheDir);
            }
        }

        @Override
        public final boolean accept(File dir, String filename) {
            return filename.startsWith(TEMP_FILE_PREFIX);
        }

        private void cleanDirectory(@NonNull final File directory) {
            final File[] toDelete = directory.listFiles(this);

            if (toDelete != null) {
                for (File file : toDelete) {
                    if (file.delete()) {
                        Log.d(RNVIEW_SHOT, "deleted file: " + file.getAbsolutePath());
                    }
                }
            }
        }
    }

    /**
     * Create a temporary file in the cache directory on either internal or external storage,
     * whichever is available and has more free space.
     */
    @NonNull
    private File createTempFile(@NonNull final Context context, @NonNull final String ext, String fileName) throws IOException {
        final File externalCacheDir = context.getExternalCacheDir();
        final File internalCacheDir = context.getCacheDir();
        final File cacheDir;

        if (externalCacheDir == null && internalCacheDir == null) {
            throw new IOException("No cache directory available");
        }

        if (externalCacheDir == null) {
            cacheDir = internalCacheDir;
        } else if (internalCacheDir == null) {
            cacheDir = externalCacheDir;
        } else {
            cacheDir = externalCacheDir.getFreeSpace() > internalCacheDir.getFreeSpace() ?
                    externalCacheDir : internalCacheDir;
        }

        final String suffix = "." + ext;
        if (fileName != null) {
            return File.createTempFile(fileName, suffix, cacheDir);
        }
        return File.createTempFile(TEMP_FILE_PREFIX, suffix, cacheDir);
    }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();

    constants.put(RNFSDocumentDirectory, 0);
    constants.put(RNFSDocumentDirectoryPath, this.getReactApplicationContext().getFilesDir().getAbsolutePath());
    constants.put(RNFSTemporaryDirectoryPath, this.getReactApplicationContext().getCacheDir().getAbsolutePath());
    constants.put(RNFSPicturesDirectoryPath, Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES).getAbsolutePath());
    constants.put(RNFSCachesDirectoryPath, this.getReactApplicationContext().getCacheDir().getAbsolutePath());
    constants.put(RNFSDownloadDirectoryPath, Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).getAbsolutePath());
    constants.put(RNFSFileTypeRegular, 0);
    constants.put(RNFSFileTypeDirectory, 1);

    File externalStorageDirectory = Environment.getExternalStorageDirectory();
    if (externalStorageDirectory != null) {
      constants.put(RNFSExternalStorageDirectoryPath, externalStorageDirectory.getAbsolutePath());
    } else {
      constants.put(RNFSExternalStorageDirectoryPath, null);
    }

    File externalDirectory = this.getReactApplicationContext().getExternalFilesDir(null);
    if (externalDirectory != null) {
      constants.put(RNFSExternalDirectoryPath, externalDirectory.getAbsolutePath());
    } else {
      constants.put(RNFSExternalDirectoryPath, null);
    }

    File externalCachesDirectory = this.getReactApplicationContext().getExternalCacheDir();
    if (externalCachesDirectory != null) {
      constants.put(RNFSExternalCachesDirectoryPath, externalCachesDirectory.getAbsolutePath());
    } else {
      constants.put(RNFSExternalCachesDirectoryPath, null);
    }

    return constants;
  }
}
