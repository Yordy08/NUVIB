export const useProductOptions = (slug: string) => {
  const selections = useState<Record<string, { size?: string; color?: string }>>('product-options', () => ({}))
  const selection = computed(() => selections.value[slug] || {})
  const setSelection = (value: { size?: string; color?: string }) => { selections.value[slug] = value }
  return { selection, setSelection }
}
