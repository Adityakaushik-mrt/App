import React, { useState } from 'react';
import { X, Download, Copy, Check, Code, Smartphone, Terminal, BookOpen, Layers } from 'lucide-react';

interface AndroidProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidProjectModal: React.FC<AndroidProjectModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'code'>('guide');
  const [activeFile, setActiveFile] = useState<string>('ExpenseEntity.kt');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const files: Record<string, { path: string; language: string; content: string }> = {
    'ExpenseEntity.kt': {
      path: 'app/src/main/java/com/mydailyexpenses/data/local/ExpenseEntity.kt',
      language: 'kotlin',
      content: `package com.mydailyexpenses.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Room Database entity representing an individual expense record.
 * Stored with amounts in integer paise (1 Rupee = 100 Paise) to avoid floating-point errors.
 */
@Entity(tableName = "expenses")
data class ExpenseEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0L,
    val title: String,
    val amountInPaise: Long, // e.g. 79900 for ₹799.00
    val category: String,
    val date: String, // ISO Format: YYYY-MM-DD
    val time: String, // 24h format: HH:mm
    val paymentMethod: String, // Cash, UPI, Debit Card, Credit Card, Bank Transfer, Other
    val notes: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
) {
    val amountInRupees: Double
        get() = amountInPaise / 100.0

    val formattedRupees: String
        get() = String.format("₹%,.2f", amountInRupees)
}`,
    },
    'ExpenseDao.kt': {
      path: 'app/src/main/java/com/mydailyexpenses/data/local/ExpenseDao.kt',
      language: 'kotlin',
      content: `package com.mydailyexpenses.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface ExpenseDao {
    @Query("SELECT * FROM expenses ORDER BY date DESC, time DESC")
    fun getAllExpenses(): Flow<List<ExpenseEntity>>

    @Query("SELECT * FROM expenses WHERE date = :dateISO ORDER BY time DESC")
    fun getExpensesForDate(dateISO: String): Flow<List<ExpenseEntity>>

    @Query("SELECT * FROM expenses WHERE date BETWEEN :startDate AND :endDate ORDER BY date DESC, time DESC")
    fun getExpensesBetweenDates(startDate: String, endDate: String): Flow<List<ExpenseEntity>>

    @Query("SELECT COALESCE(SUM(amountInPaise), 0) FROM expenses WHERE date = :dateISO")
    fun getDailyTotalPaise(dateISO: String): Flow<Long>

    @Query("SELECT * FROM expenses WHERE id = :id")
    suspend fun getExpenseById(id: Long): ExpenseEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExpense(expense: ExpenseEntity): Long

    @Update
    suspend fun updateExpense(expense: ExpenseEntity)

    @Delete
    suspend fun deleteExpense(expense: ExpenseEntity)

    @Query("DELETE FROM expenses WHERE id = :id")
    suspend fun deleteById(id: Long)

    @Query("DELETE FROM expenses")
    suspend fun clearAll()
}`,
    },
    'AppDatabase.kt': {
      path: 'app/src/main/java/com/mydailyexpenses/data/local/AppDatabase.kt',
      language: 'kotlin',
      content: `package com.mydailyexpenses.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [ExpenseEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun expenseDao(): ExpenseDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "my_daily_expenses_database"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}`,
    },
    'ExpenseViewModel.kt': {
      path: 'app/src/main/java/com/mydailyexpenses/ui/viewmodel/ExpenseViewModel.kt',
      language: 'kotlin',
      content: `package com.mydailyexpenses.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mydailyexpenses.data.local.ExpenseDao
import com.mydailyexpenses.data.local.ExpenseEntity
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter

class ExpenseViewModel(private val dao: ExpenseDao) : ViewModel() {
    val allExpenses = dao.getAllExpenses().stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        emptyList()
    )

    private val _selectedDate = MutableStateFlow(LocalDate.now().toString())
    val selectedDate: StateFlow<String> = _selectedDate.asStateFlow()

    val todayExpenses = _selectedDate.flatMapLatest { date ->
        dao.getExpensesForDate(date)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val todayTotalPaise = _selectedDate.flatMapLatest { date ->
        dao.getDailyTotalPaise(date)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0L)

    fun addExpense(
        title: String,
        amountInRupees: Double,
        category: String,
        date: String,
        time: String,
        paymentMethod: String,
        notes: String?
    ) {
        val paise = (amountInRupees * 100).toLong()
        viewModelScope.launch {
            dao.insertExpense(
                ExpenseEntity(
                    title = title,
                    amountInPaise = paise,
                    category = category,
                    date = date,
                    time = time,
                    paymentMethod = paymentMethod,
                    notes = notes
                )
            )
        }
    }

    fun deleteExpense(expense: ExpenseEntity) {
        viewModelScope.launch {
            dao.deleteExpense(expense)
        }
    }
}`,
    },
    'HomeScreen.kt': {
      path: 'app/src/main/java/com/mydailyexpenses/ui/screens/HomeScreen.kt',
      language: 'kotlin',
      content: `package com.mydailyexpenses.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.mydailyexpenses.ui.viewmodel.ExpenseViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: ExpenseViewModel,
    onNavigateToAddExpense: () -> Unit
) {
    val expenses by viewModel.todayExpenses.collectAsState()
    val totalPaise by viewModel.todayTotalPaise.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Daily Expenses") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = onNavigateToAddExpense) {
                Icon(Icons.Default.Add, contentDescription = "Add Expense")
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant
                    )
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Today's Total Expenses",
                            style = MaterialTheme.typography.labelMedium
                        )
                        Text(
                            text = String.format("₹%,.2f", totalPaise / 100.0),
                            style = MaterialTheme.typography.headlineLarge,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }

            items(expenses) { expense ->
                Card(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(text = expense.title, style = MaterialTheme.typography.titleMedium)
                            Text(text = expense.category, style = MaterialTheme.typography.bodySmall)
                        }
                        Text(
                            text = expense.formattedRupees,
                            style = MaterialTheme.typography.titleMedium
                        )
                    }
                }
            }
        }
    }
}`,
    },
    'build.gradle.kts': {
      path: 'app/build.gradle.kts',
      language: 'kotlin',
      content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.mydailyexpenses"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.mydailyexpenses"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}

dependencies {
    // Jetpack Compose & Material 3
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")

    // Room Database
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    ksp("androidx.room:room-compiler:2.6.1")

    // Navigation & Icons
    implementation("androidx.navigation:navigation-compose:2.7.7")
    implementation("androidx.compose.material:material-icons-extended")
}`,
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(files[activeFile].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    // Generate combined bundle
    let fullBundle = `// ==========================================\n// MY DAILY EXPENSES - ANDROID STUDIO PROJECT\n// Generated Project Structure & Kotlin Files\n// ==========================================\n\n`;
    Object.entries(files).forEach(([name, f]) => {
      fullBundle += `\n\n// ==========================================\n// FILE: ${f.path}\n// ==========================================\n${f.content}\n`;
    });

    const blob = new Blob([fullBundle], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'MyDailyExpenses_AndroidStudio_ProjectSource.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 h-[88vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Smartphone size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Android Studio Project & APK Generation
              </h2>
              <p className="text-xs text-slate-500">
                Native Kotlin · Jetpack Compose · Room Database · MVVM Architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector: Guide vs Source Code */}
        <div className="bg-slate-100 dark:bg-slate-800/80 px-5 py-2.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="inline-flex rounded-xl p-1 bg-white dark:bg-slate-900 shadow-xs">
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'guide'
                  ? 'bg-[#006874] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Smartphone size={14} /> How to Download & Install APK
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'code'
                  ? 'bg-[#006874] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Code size={14} /> Android Studio Source Files
            </button>
          </div>

          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#006874] text-white font-semibold rounded-xl hover:bg-[#00525c] transition text-xs shadow-xs"
          >
            <Download size={13} /> Download Source Code (.txt/.kt)
          </button>
        </div>

        {/* TAB 1: APK GENERATION & INSTALLATION GUIDE */}
        {activeTab === 'guide' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
            
            {/* Method 1: Instant WebAPK Install on Android Phone */}
            <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Direct 1-Click Install onto Android Phone (Instant WebAPK)
                  </h3>
                  <p className="text-xs text-slate-500">
                    No PC or Android Studio compilation required
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pl-10">
                <p>
                  1. Open this application link in <strong>Google Chrome</strong> on your Android mobile phone:
                </p>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-900 font-mono text-[11px] select-all break-all text-[#006874] dark:text-[#97f0ff]">
                  https://ais-pre-gzhpfmg4voouchgditcanj-989408917720.asia-southeast1.run.app
                </div>
                <p>
                  2. Tap the <strong>three dots (&vellip;)</strong> menu in Chrome &rarr; Tap <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong>.
                </p>
                <p>
                  3. Android's WebAPK system automatically builds a native Android APK and installs <strong>"My Daily Expenses"</strong> directly into your phone's app drawer with standalone windowing and offline storage!
                </p>
              </div>
            </div>

            {/* Method 2: Android Studio Native Kotlin APK Build */}
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#006874] text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Generate Native APK using Android Studio
                  </h3>
                  <p className="text-xs text-slate-500">
                    Compile the Kotlin, Room Database & Jetpack Compose project into an APK file
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 pl-10">
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">Step 1: Download the Project Code</span>
                  <p>
                    Click the <strong>"Download Source Code"</strong> button above to get the full Kotlin source files (`ExpenseEntity.kt`, `ExpenseDao.kt`, `AppDatabase.kt`, `ExpenseViewModel.kt`, `HomeScreen.kt`, `build.gradle.kts`).
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">Step 2: Open in Android Studio</span>
                  <p>
                    Open Android Studio &rarr; Select <strong>New Project</strong> &rarr; <strong>Empty Activity (Compose)</strong> with package name <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">com.mydailyexpenses</code>. Place the downloaded files into their respective directories.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">Step 3: Build the Debug APK</span>
                  <p>
                    In the Android Studio menu, click:
                  </p>
                  <div className="p-2.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px]">
                    Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)
                  </div>
                  <p>Or run the Gradle wrapper command in terminal:</p>
                  <div className="p-2.5 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] flex items-center justify-between">
                    <span>./gradlew assembleDebug</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">Step 4: Locate & Install the APK</span>
                  <p>
                    Once the build completes, Android Studio outputs the APK file at:
                  </p>
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px] rounded-xl text-slate-800 dark:text-slate-200">
                    app/build/outputs/apk/debug/app-debug.apk
                  </div>
                  <p>
                    Transfer this <code className="font-mono text-[#006874] dark:text-[#97f0ff]">app-debug.apk</code> to your phone (via USB, Google Drive, or Bluetooth), tap on it in your phone's File Manager, and tap <strong>Install</strong>!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CODE VIEWER */}
        {activeTab === 'code' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* File Explorer Sidebar */}
            <div className="w-full md:w-64 border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3 overflow-y-auto space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center gap-1.5">
                <Layers size={12} /> Android Project Files
              </div>
              {Object.keys(files).map((filename) => (
                <button
                  key={filename}
                  onClick={() => setActiveFile(filename)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-left transition ${
                    activeFile === filename
                      ? 'bg-white dark:bg-slate-800 text-[#006874] dark:text-[#97f0ff] font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Code size={13} className="shrink-0 text-slate-400" />
                  <span className="truncate">{filename}</span>
                </button>
              ))}
            </div>

            {/* Active File Code Editor View */}
            <div className="flex-1 flex flex-col bg-slate-900 text-slate-100 overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400 truncate">
                  {files[activeFile].path}
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-[11px]"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed text-slate-200 selection:bg-[#006874]">
                <code>{files[activeFile].content}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
