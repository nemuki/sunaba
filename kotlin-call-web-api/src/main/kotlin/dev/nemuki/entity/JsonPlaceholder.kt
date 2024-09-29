package dev.nemuki.entity

import kotlinx.serialization.Serializable

@Serializable
data class JsonPlaceholder(
    val userId: Int,
    val id: Int,
    val title: String,
    val body: String,
)
