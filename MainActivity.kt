package com.pribadi.parentcontrol

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.database.FirebaseDatabase

class MainActivity : AppCompatActivity() {

    // Inisialisasi Firebase Realtime Database
    private val database = FirebaseDatabase.getInstance().reference

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val etPin = findViewById<EditText>(R.id.etPin)
        val btnLock = findViewById<Button>(R.id.btnLock)
        val btnStartService = findViewById<Button>(R.id.btnStartService)

        // Tombol untuk mengunci HP Anak (Sisi Orang Tua)
        btnLock.setOnClickListener {
            val pin = etPin.text.toString()
            if (pin.isNotEmpty()) {
                // Update Firebase: Set PIN dan is_locked = true
                val updates = hashMapOf<String, Any>(
                    "status/lock_pin" to pin,
                    "status/is_locked" to true
                )
                database.updateChildren(updates).addOnSuccessListener {
                    Toast.makeText(this, "HP Anak Berhasil Dikunci", Toast.LENGTH_SHORT).show()
                }.addOnFailureListener {
                    Toast.makeText(this, "Gagal mengunci: ${it.message}", Toast.LENGTH_SHORT).show()
                }
            } else {
                Toast.makeText(this, "Masukkan PIN terlebih dahulu", Toast.LENGTH_SHORT).show()
            }
        }

        // Tombol untuk menjalankan Service di HP Anak
        btnStartService.setOnClickListener {
            if (checkOverlayPermission()) {
                val intent = Intent(this, LockOverlayService::class.java)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    startForegroundService(intent)
                } else {
                    startService(intent)
                }
                Toast.makeText(this, "Service Anak Berjalan", Toast.LENGTH_SHORT).show()
            } else {
                requestOverlayPermission()
            }
        }
    }

    // Cek izin SYSTEM_ALERT_WINDOW
    private fun checkOverlayPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Settings.canDrawOverlays(this)
        } else {
            true
        }
    }

    // Minta izin SYSTEM_ALERT_WINDOW jika belum diberikan
    private fun requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName")
            )
            startActivityForResult(intent, 1234)
        }
    }
}