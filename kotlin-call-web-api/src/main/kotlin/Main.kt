import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse

fun main() {
    println("Hello World!")

    val client = HttpClient.newHttpClient()
    val request = HttpRequest
        .newBuilder(
            URI.create("https://jsonplaceholder.typicode.com/posts"),
        )
        .build()

    val response = client.send(
        request,
        HttpResponse.BodyHandlers.ofString()
    )

    println(response.body())
}
