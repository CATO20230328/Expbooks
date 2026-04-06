import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData, resolvePostProps } from '@/lib/db/SiteDataApi'
import { checkSlugHasMorThanTwoSlash } from '@/lib/utils/post'
import Slug from '..'

const DynamicSlug = props => {
  return <Slug {...props} />
}

export async function getStaticPaths() {
  if (!BLOG.isProd) {
    return { paths: [], fallback: true }
  }

  const from = 'slug-paths'
  const { allPages } = await fetchGlobalAllData({ from })

  // 这里就是修复！之前你写了 ids.map，但是没定义 ids
  const paths = allPages
    ?.filter(row => row?.slug)
    .map(row => ({
      params: {
        slug: row.slug.split('/')[0],
        suffix: row.slug.split('/').slice(1)
      }
    }))

  return { paths: paths || [], fallback: true }
}

export async function getStaticProps({ params: { slug, suffix }, locale }) {
  const props = await resolvePostProps({ slug, suffix, locale })
  return {
    props,
    revalidate: process.env.EXPORT
      ? undefined
      : siteConfig('NEXT_REVALIDATE_SECOND', BLOG.NEXT_REVALIDATE_SECOND, props.NOTION_CONFIG)
  }
}

export default DynamicSlug
