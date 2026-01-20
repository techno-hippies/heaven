# Build stage
FROM rust:1.85-bookworm AS builder

WORKDIR /app

# Copy manifests
COPY Cargo.toml Cargo.lock* ./

# Create dummy src to cache dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs
# Pin home crate to version compatible with Rust 1.85
RUN cargo update --precise 0.5.9 home
RUN cargo build --release
RUN rm -rf src

# Copy actual source
COPY src ./src
COPY migrations ./migrations

# Build for real
RUN touch src/main.rs && cargo build --release

# Runtime stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    wireguard-tools \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/release/hp-dns-gw /usr/local/bin/
COPY --from=builder /app/migrations ./migrations

ENV RUST_LOG=info

EXPOSE 53/udp
EXPOSE 53/tcp
EXPOSE 8080

CMD ["hp-dns-gw"]
