<script lang="ts">
  interface ImageData {
    src: string;
    alt: string;
    srcset?: string;
    sizes?: string;
  }

  export let images: ImageData[] = [];
  let currentIndex = 0;

  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
  }

  function goToImage(index: number) {
    currentIndex = index;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      prevImage();
    } else if (event.key === 'ArrowRight') {
      nextImage();
    }
  }

  $: showCarousel = images.length > 1;
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="image-carousel">
  {#if images.length > 0}
    <div class="carousel-main">
      {#if showCarousel}
        <button 
          class="carousel-btn carousel-btn-prev" 
          on:click={prevImage}
          aria-label="Previous image"
        >
          ‹
        </button>
      {/if}

      <img
        class="carousel-image divider"
        src={images[currentIndex].src}
        srcset={images[currentIndex].srcset}
        sizes={images[currentIndex].sizes}
        alt={images[currentIndex].alt}
      />

      {#if showCarousel}
        <button 
          class="carousel-btn carousel-btn-next" 
          on:click={nextImage}
          aria-label="Next image"
        >
          ›
        </button>
      {/if}
    </div>

    {#if showCarousel}
      <div class="carousel-thumbnails">
        {#each images as image, index}
          <button
            class="thumbnail-btn"
            class:active={currentIndex === index}
            on:click={() => goToImage(index)}
            aria-label={`View image ${index + 1}`}
          >
            <img
              src={image.src}
              alt={`Thumbnail ${index + 1}`}
            />
          </button>
        {/each}
      </div>

      <div class="carousel-indicators">
        <span class="indicator-text">{currentIndex + 1} / {images.length}</span>
      </div>
    {/if}
  {/if}
</div>

<style>
  .image-carousel {
    width: 100%;
  }

  .carousel-main {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .carousel-image {
    max-width: 100%;
    height: auto;
    display: block;
  }

  .carousel-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    font-size: 3rem;
    width: 50px;
    height: 50px;
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s ease;
    z-index: 10;
    line-height: 1;
    padding: 0;
  }

  .carousel-btn:hover {
    background: rgba(0, 0, 0, 0.7);
  }

  .carousel-btn:focus {
    outline: 2px solid var(--primary-color, #007bff);
    outline-offset: 2px;
  }

  .carousel-btn-prev {
    left: 10px;
  }

  .carousel-btn-next {
    right: 10px;
  }

  .carousel-thumbnails {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 15px;
    flex-wrap: wrap;
  }

  .thumbnail-btn {
    border: 2px solid transparent;
    padding: 0;
    cursor: pointer;
    background: none;
    transition: border-color 0.3s ease, transform 0.2s ease;
    width: 80px;
    height: 80px;
    overflow: hidden;
  }

  .thumbnail-btn img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .thumbnail-btn:hover {
    border-color: var(--primary-color, #007bff);
    transform: scale(1.05);
  }

  .thumbnail-btn.active {
    border-color: var(--primary-color, #007bff);
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  }

  .thumbnail-btn:focus {
    outline: 2px solid var(--primary-color, #007bff);
    outline-offset: 2px;
  }

  .carousel-indicators {
    text-align: center;
    margin-top: 10px;
  }

  .indicator-text {
    font-size: 0.9rem;
    color: #666;
  }

  @media (max-width: 600px) {
    .carousel-btn {
      width: 40px;
      height: 40px;
      font-size: 2rem;
    }

    .thumbnail-btn {
      width: 60px;
      height: 60px;
    }
  }
</style>
