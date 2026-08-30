import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { Box, IconButton, MenuItem, Select, Tooltip, Typography, type SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SortType } from '../../../enums/sortType';
import type { CustomOption } from '../../../types/customOption';

interface Props<T extends string | number | symbol> {
  activeSort: SortType;
  activeSortBy: CustomOption<T>;
  sortByOptions: CustomOption<T>[];
  onChange?: (value: { sortBy: CustomOption<T>; sort: SortType }) => void;
}
export const FilterSortBar = <T extends string | number | symbol>({
  activeSort,
  activeSortBy,
  sortByOptions,
  onChange = () => {}
}: Props<T>) => {
  const { t } = useTranslation();

  const onSortChange = (sort: SortType) => {
    onChange({ sort: sort, sortBy: activeSortBy });
  };

  const onSortByChange = (event: SelectChangeEvent<T>) => {
    const value = event.target.value;
    const selectedSortBy = sortByOptions.find(item => item.value === value);

    onChange({ sort: activeSort, sortBy: selectedSortBy ?? activeSortBy });
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box></Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography>{t('common.sortBy')}:</Typography>
          <Select size="small" value={activeSortBy.value} onChange={onSortByChange}>
            {sortByOptions.map(item => (
              <MenuItem key={item.value.toString()} value={item.value.toString()}>
                {item.label}
              </MenuItem>
            ))}
          </Select>

          {activeSort === SortType.DEFAULT && (
            <Tooltip title={t('ariaLabel.noSort')}>
              <IconButton aria-label={t('ariaLabel.noSort')} onClick={() => onSortChange(SortType.DESC)}>
                <UnfoldMoreIcon />
              </IconButton>
            </Tooltip>
          )}
          {activeSort === SortType.ASC && (
            <Tooltip title={t('ariaLabel.ascending')}>
              <IconButton aria-label={t('ariaLabel.ascending')} onClick={() => onSortChange(SortType.DEFAULT)}>
                <ArrowUpwardIcon />
              </IconButton>
            </Tooltip>
          )}
          {activeSort === SortType.DESC && (
            <Tooltip title={t('ariaLabel.descending')}>
              <IconButton aria-label={t('ariaLabel.ascending')} onClick={() => onSortChange(SortType.ASC)}>
                <ArrowDownwardIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </>
  );
};
